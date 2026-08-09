from django.contrib import admin
from django.utils.html import format_html

from .models import ContactMessage, CtaChip, Faq, Logo, Project, Shot, Stat


def thumb(field, height=34, pad="transparent"):
    if not field:
        return "—"
    return format_html(
        '<img src="{}" style="height:{}px;max-width:130px;object-fit:contain;'
        'background:{};padding:3px;border-radius:4px" />',
        field.url, height, pad,
    )


class ShotInline(admin.TabularInline):
    model = Shot
    extra = 2
    verbose_name_plural = "Extra images — shown as a pair partway down the project page"


class StatInline(admin.TabularInline):
    model = Stat
    extra = 3
    verbose_name_plural = (
        "Result numbers — add them only if the figures are real and agreed. "
        "Leave every row empty and the band is hidden on the page entirely."
    )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("card_preview", "title", "client", "year", "order", "published")
    list_display_links = ("title",)
    list_editable = ("order", "published")
    list_filter = ("published", "sector", "year")
    search_fields = ("client", "title", "line")
    prepopulated_fields = {"slug": ("client",)}
    readonly_fields = ("image_preview",)
    inlines = [ShotInline, StatInline]

    fieldsets = (
        ("The basics", {
            "description": "Who the work was for and what it is called. This is what "
                           "people see on the main work page and at the top of this "
                           "project's own page.",
            "fields": ("client", "title", "line", "year", "sector", "slug"),
        }),
        ("Tags", {
            "description": "Two short lists, each separated by commas. Type them exactly "
                           "as you want them to read — they are shown to visitors as "
                           "written.",
            "fields": ("disciplines", "scope"),
        }),
        ("The write-up", {
            "description": "The three blocks of writing on the project page, in the order "
                           "they appear. Plain sentences work best — no headings or "
                           "bullet points.",
            "fields": ("brief", "approach", "outcome"),
        }),
        ("Images", {
            "description": "Upload the best quality you have. Images are shrunk and "
                           "compressed automatically, so a large photo straight from a "
                           "camera or phone is fine. Nothing is cropped — the shapes below "
                           "are what looks best, not a requirement.",
            "fields": ("image_preview", "card", "hero", "thumb"),
        }),
        ("Position on the work page", {
            "classes": ("collapse",),
            "description": "Controls where this project's card sits in the layout of the "
                           "work page. You can safely ignore this section unless you are "
                           "rearranging the page — the defaults will place the card sensibly.",
            "fields": (("start", "span"), ("row", "off")),
        }),
        ("Publishing", {
            "description": "Where this project appears in the list, and whether it is "
                           "visible at all.",
            "fields": ("order", "published"),
        }),
    )

    @admin.display(description="")
    def card_preview(self, obj):
        return thumb(obj.card)

    @admin.display(description="Currently uploaded")
    def image_preview(self, obj):
        if not obj.pk:
            return "Save the project once and the images you upload will preview here."
        return format_html(
            '<div style="display:flex;gap:22px;align-items:flex-end">'
            '<div><div style="font-size:11px;color:#666;margin-bottom:4px">Card</div>{}</div>'
            '<div><div style="font-size:11px;color:#666;margin-bottom:4px">Banner</div>{}</div>'
            '<div><div style="font-size:11px;color:#666;margin-bottom:4px">Thumbnail</div>{}</div>'
            '</div>',
            thumb(obj.card, 60), thumb(obj.hero, 60), thumb(obj.thumb, 60),
        )


class CtaChipInline(admin.TabularInline):
    model = CtaChip
    extra = 0
    verbose_name_plural = (
        "Places this logo floats on the home page — add a row for each position, "
        "or leave empty to keep it off the home page"
    )


@admin.register(Logo)
class LogoAdmin(admin.ModelAdmin):
    list_display = ("logo_preview", "name", "on_home_page", "order", "published")
    list_display_links = ("name",)
    list_editable = ("order", "published")
    search_fields = ("name",)
    readonly_fields = ("logo_preview",)
    inlines = [CtaChipInline]

    fieldsets = (
        (None, {
            "description": "A client logo, uploaded once. It appears in the sliding strip "
                           "on the About page, and can also be placed on the home page "
                           "using the section underneath.",
            "fields": ("name", "image", "logo_preview", "order", "published"),
        }),
    )

    @admin.display(description="Logo")
    def logo_preview(self, obj):
        # a light background, since most logos are dark on transparent
        return thumb(obj.image, pad="#f4f4f4")

    @admin.display(description="On home page")
    def on_home_page(self, obj):
        count = obj.chips.count()
        return f"{count} place{'s' if count != 1 else ''}" if count else "—"


@admin.register(CtaChip)
class CtaChipAdmin(admin.ModelAdmin):
    """Registered standalone as well as inline — positioning the scatter is far
    easier with every chip in one editable list than one logo at a time."""

    list_display = ("logo_preview", "logo", "size", "x", "y", "rot", "order")
    list_display_links = ("logo",)
    list_editable = ("size", "x", "y", "rot", "order")
    list_select_related = ("logo",)

    fieldsets = (
        (None, {
            "description": "One logo floating in the \"Start your project\" section at the "
                           "bottom of the home page. Think of the section as a rectangle: "
                           "position is measured as a percentage across and down it. Change "
                           "a number, save, and reload the home page to see where it lands.",
            "fields": ("logo", "size", ("x", "y"), "rot", "order"),
        }),
    )

    @admin.display(description="")
    def logo_preview(self, obj):
        return thumb(obj.logo.image, pad="#f4f4f4")


@admin.register(Faq)
class FaqAdmin(admin.ModelAdmin):
    list_display = ("title", "order", "published")
    list_display_links = ("title",)
    list_editable = ("order", "published")
    search_fields = ("title", "body")

    fieldsets = (
        (None, {
            "description": "One row of the expanding list in the \"That's not all.\" "
                           "section near the bottom of the services page. Visitors see "
                           "the heading, and the details appear when they click it.",
            "fields": ("title", "body", "order", "published"),
        }),
    )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """Read-only on purpose — this is a record of what people sent, not content
    to edit. Delete is left available for clearing out spam."""

    list_display = ("name", "company", "email", "received", "sent")
    list_filter = ("sent", "received")
    search_fields = ("name", "company", "email", "message")
    date_hierarchy = "received"
    readonly_fields = ("name", "company", "email", "phone", "message",
                       "received", "sent", "error")

    fieldsets = (
        ("Who got in touch", {
            "description": "Submitted through the form on the contact page. Nothing here "
                           "can be edited — it is a record of exactly what was sent.",
            "fields": ("name", "company", "email", "phone", "received"),
        }),
        ("Their message", {"fields": ("message",)}),
        ("Delivery", {
            "description": "Whether the enquiry reached the studio inbox. If it did not, "
                           "the message is still safely recorded above and can be answered "
                           "by hand.",
            "fields": ("sent", "error"),
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
