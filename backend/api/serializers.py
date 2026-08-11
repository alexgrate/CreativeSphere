from rest_framework import serializers

from .models import (
    ContactMessage,
    CtaChip,
    Faq,
    Format,
    GalleryImage,
    Logo,
    Milestone,
    Project,
)


def split(text):
    return [part.strip() for part in text.split(",") if part.strip()]


def file_url(field, request):
    if not field:
        return None
    return request.build_absolute_uri(field.url) if request else field.url


class ProjectSerializer(serializers.ModelSerializer):
    """Emits the same object shape the work page used to import from site.js."""

    id = serializers.CharField(source="slug")
    disciplines = serializers.SerializerMethodField()
    scope = serializers.SerializerMethodField()
    img = serializers.SerializerMethodField()
    hero = serializers.SerializerMethodField()
    thumb = serializers.SerializerMethodField()
    shots = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "client", "title", "line", "disciplines", "year", "img",
            "sector", "scope", "brief", "approach", "outcome", "stats",
            "hero", "thumb", "shots", "start", "span", "row", "off",
        ]

    def url(self, image):
        return file_url(image, self.context.get("request"))

    def get_disciplines(self, obj):
        return split(obj.disciplines)

    def get_scope(self, obj):
        return split(obj.scope)

    def get_img(self, obj):
        return self.url(obj.card)

    def get_hero(self, obj):
        return self.url(obj.hero)

    def get_thumb(self, obj):
        return self.url(obj.thumb or obj.card)

    def get_shots(self, obj):
        return [self.url(shot.image) for shot in obj.shots.all()]

    def get_stats(self, obj):
        rows = [{"v": stat.value, "l": stat.label} for stat in obj.stats.all()]
        return rows or None


class LogoSerializer(serializers.ModelSerializer):
    """The sliding strip on /about — same {name, src} shape it used before."""

    src = serializers.SerializerMethodField()

    class Meta:
        model = Logo
        fields = ["name", "src"]

    def get_src(self, obj):
        return file_url(obj.image, self.context.get("request"))


class CtaChipSerializer(serializers.ModelSerializer):
    """The scattered chips on the home CTA — {src, size, x, y, rot} as before."""

    src = serializers.SerializerMethodField()

    class Meta:
        model = CtaChip
        fields = ["src", "size", "x", "y", "rot"]

    def get_src(self, obj):
        return file_url(obj.logo.image, self.context.get("request"))


class FaqSerializer(serializers.ModelSerializer):
    """The expanding rows on the services page. `id` is the primary key — the
    frontend only uses it for React keys and the accordion's aria wiring."""

    class Meta:
        model = Faq
        fields = ["id", "title", "body"]


class ContactMessageSerializer(serializers.ModelSerializer):
    """Validates one contact form submission.

    `website` is a honeypot: the form renders it hidden, so a human never fills
    it in and a bot that fills every field gives itself away.
    """

    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = ContactMessage
        fields = ["name", "company", "email", "phone", "message", "website"]
        extra_kwargs = {
            "name": {"error_messages": {"blank": "Required"}},
            "company": {"error_messages": {"blank": "Required"}},
            "email": {"error_messages": {"blank": "Required",
                                         "invalid": "Enter a valid email address"}},
            "message": {"error_messages": {"blank": "Required"}},
        }

    def validate_message(self, value):
        # the textarea caps at 600 characters; anything longer did not come from the form
        if len(value) > 600:
            raise serializers.ValidationError("Message is too long")
        return value

    def validate(self, attrs):
        if attrs.pop("website", ""):
            raise serializers.ValidationError("Rejected")
        return attrs


class FormatSerializer(serializers.ModelSerializer):
    """The home page carousel — same {id, img, alt} shape it used before."""

    img = serializers.SerializerMethodField()

    class Meta:
        model = Format
        fields = ["id", "img", "alt"]

    def get_img(self, obj):
        return file_url(obj.image, self.context.get("request"))


class GalleryImageSerializer(serializers.ModelSerializer):
    """The sliding strip on the services page — {id, src, alt} as before."""

    src = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = ["id", "src", "alt"]

    def get_src(self, obj):
        return file_url(obj.image, self.context.get("request"))


class MilestoneSerializer(serializers.ModelSerializer):
    """The About page timeline — {id, year, title, body, img, alt}."""

    img = serializers.SerializerMethodField()

    class Meta:
        model = Milestone
        fields = ["id", "year", "title", "body", "img", "alt"]

    def get_img(self, obj):
        return file_url(obj.image, self.context.get("request"))
