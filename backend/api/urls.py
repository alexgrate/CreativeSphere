from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ContactView,
    CtaChipViewSet,
    FaqViewSet,
    FormatViewSet,
    GalleryImageViewSet,
    LogoViewSet,
    ProjectViewSet,
)

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("logos", LogoViewSet, basename="logo")
router.register("cta-logos", CtaChipViewSet, basename="cta-logo")
router.register("faqs", FaqViewSet, basename="faq")
router.register("formats", FormatViewSet, basename="format")
router.register("gallery", GalleryImageViewSet, basename="gallery")

urlpatterns = [
    path("contact/", ContactView.as_view(), name="contact"),
    path("", include(router.urls)),
]
