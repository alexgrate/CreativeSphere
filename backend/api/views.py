import logging

from rest_framework import generics, permissions, viewsets
from rest_framework.throttling import ScopedRateThrottle

from .mail import send_enquiry
from .models import CtaChip, Faq, Format, GalleryImage, Logo, Project
from .serializers import (
    ContactMessageSerializer,
    CtaChipSerializer,
    FaqSerializer,
    FormatSerializer,
    GalleryImageSerializer,
    LogoSerializer,
    ProjectSerializer,
)

log = logging.getLogger(__name__)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = ProjectSerializer
    lookup_field = "slug"
    queryset = Project.objects.filter(published=True).prefetch_related("shots", "stats")


class LogoViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = LogoSerializer
    queryset = Logo.objects.filter(published=True)


class CtaChipViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = CtaChipSerializer
    queryset = CtaChip.objects.filter(logo__published=True).select_related("logo")


class FaqViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = FaqSerializer
    queryset = Faq.objects.filter(published=True)


class ContactView(generics.CreateAPIView):
    """The only public write on the API.

    Authentication is switched off rather than left to default, so DRF does not
    apply session CSRF to a form posted from another origin. Throttled per IP.
    """

    serializer_class = ContactMessageSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact"

    def perform_create(self, serializer):
        enquiry = serializer.save()

        # the enquiry is already stored, so a failure here is worth reporting but
        # not worth failing the visitor's submission over
        try:
            send_enquiry(enquiry)
            enquiry.sent = True
        except Exception as exc:
            enquiry.error = f"{type(exc).__name__}: {exc}"[:2000]
            log.exception("contact enquiry %s could not be emailed", enquiry.pk)

        enquiry.save(update_fields=["sent", "error"])


class FormatViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = FormatSerializer
    queryset = Format.objects.filter(published=True)


class GalleryImageViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = GalleryImageSerializer
    queryset = GalleryImage.objects.filter(published=True)
