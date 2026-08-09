from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.validators import FileExtensionValidator
from django.db import models
from PIL import Image, ImageOps


def render_webp(field, max_edge):
    """Shrink an upload to a sane ceiling and store it as WebP.

    Nothing is cropped — the aspect ratio is kept exactly as uploaded and the
    CSS goes on handling the framing. `thumbnail` bounds the longest edge and
    never upscales, so a small file is only ever re-encoded, not stretched.

    `_committed` is False only for a file that has just been assigned and not
    yet written to storage, so this runs on new uploads and skips everything
    else — re-saving a project in the admin never recompresses what is already
    there, and the seed command's existing files are left alone.
    """
    if not field or field._committed:
        return

    # SVG is already the smallest and sharpest form a logo can take, and Pillow
    # cannot open it anyway — store it untouched
    if Path(field.name).suffix.lower() == ".svg":
        return

    img = ImageOps.exif_transpose(Image.open(field))
    img.thumbnail((max_edge, max_edge), Image.LANCZOS)
    img = img.convert("RGBA" if img.mode in ("RGBA", "LA") else "RGB")

    buf = BytesIO()
    img.save(buf, "WEBP", quality=85, method=6)
    field.save(f"{Path(field.name).stem}.webp", ContentFile(buf.getvalue()), save=False)


class Project(models.Model):

    slug = models.SlugField(
        "Page address", unique=True,
        help_text="The last part of this project's web address. Entering \"vfd\" puts the "
                  "page at /work/vfd. Lowercase letters and hyphens only, no spaces. "
                  "Avoid changing it once the project is live — any link already shared "
                  "will stop working.")
    client = models.CharField(
        "Client name", max_length=120,
        help_text="The company the work was for, for example \"VFD / Vbank\". Shown in "
                  "small type above the project title.")
    title = models.CharField(
        "Project title", max_length=160,
        help_text="The headline for this project, for example \"A bank people talk about\". "
                  "Keep it short — it is set in very large type and long titles wrap awkwardly.")
    line = models.CharField(
        "One-line summary", max_length=240,
        help_text="A single sentence shown under the title, roughly 8 to 14 words. "
                  "For example \"Roughly 100 followers to over 10,000 in nine months.\"")
    year = models.CharField(
        "Year", max_length=9,
        help_text="The year the work was delivered, for example 2024.")
    sector = models.CharField(
        "Industry", max_length=80,
        help_text="The client's industry, for example Banking, FMCG or Legal. Appears in "
                  "the facts list on the project page.")

    disciplines = models.CharField(
        "Disciplines", max_length=200,
        help_text="The kinds of work involved, separated by commas: Social, Content, "
                  "Analytics. Each one becomes a small tag on the work page card.")
    scope = models.CharField(
        "Scope of work", max_length=300,
        help_text="What you actually delivered, separated by commas: Social strategy, "
                  "Content production, Reporting. Appears in the facts list on the project page.")

    brief = models.TextField(
        "The situation",
        help_text="What the client was facing before you started, and why it mattered. "
                  "Two to four sentences.")
    approach = models.TextField(
        "What we did",
        help_text="How you solved it. Two to four sentences.")
    outcome = models.TextField(
        "The result",
        help_text="What changed for the client. One or two sentences — this is set in "
                  "large type near the bottom of the page.")

    card = models.ImageField(
        "Card image", upload_to="work/",
        help_text="The image for this project on the main work page. A landscape shape "
                  "works best. Upload the best quality you have — it is compressed for you.")
    hero = models.ImageField(
        "Banner image", upload_to="work/",
        help_text="The wide image across the top of this project's own page. A very wide "
                  "shape works best. Keep the important part near the middle: the banner "
                  "is trimmed at the sides on a phone.")
    thumb = models.ImageField(
        "Thumbnail", upload_to="work/", blank=True,
        help_text="A small version used by the floating images at the top of the work page "
                  "and by the \"next project\" link. Optional — the card image is used if "
                  "you leave this empty, though a small, tightly cropped image looks better.")

    start = models.PositiveSmallIntegerField(
        "Starts at column", default=1,
        help_text="The work page is divided into 12 columns across. This is the column the "
                  "card starts in: 1 is hard left, 12 is hard right.")
    span = models.PositiveSmallIntegerField(
        "Width in columns", default=6,
        help_text="How many of the 12 columns the card fills. 6 is half the page width, "
                  "4 is a third. Starting column plus width should not go past 13.")
    row = models.PositiveSmallIntegerField(
        "Row", default=1,
        help_text="Which row down the page the card sits on. Two projects normally share "
                  "a row, at different widths.")
    off = models.PositiveSmallIntegerField(
        "Drop down by", default=0,
        help_text="Pushes the card further down its row, in pixels, so the two cards in a "
                  "row do not line up in a neat pair. 0 to 150 is the usual range.")

    order = models.PositiveIntegerField(
        "Display order", default=0,
        help_text="Projects are listed lowest number first. Ties are broken by whichever "
                  "was added first.")
    published = models.BooleanField(
        "Published", default=True,
        help_text="Untick to take this project off the website without deleting it.")
    created = models.DateTimeField(auto_now_add=True)

    # ceiling on the longest edge, comfortably above what each slot renders at
    MAX_EDGE = {"card": 1600, "hero": 2000, "thumb": 600}

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.client} — {self.title}"

    def save(self, *args, **kwargs):
        for name, max_edge in self.MAX_EDGE.items():
            render_webp(getattr(self, name), max_edge)
        super().save(*args, **kwargs)


class Shot(models.Model):
    project = models.ForeignKey(Project, related_name="shots", on_delete=models.CASCADE)
    image = models.ImageField(
        "Image", upload_to="work/",
        help_text="An extra image shown further down the project page, below the writing.")
    order = models.PositiveIntegerField(
        "Display order", default=0,
        help_text="Lowest number appears first.")

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Extra image"
        verbose_name_plural = "Extra images"

    def __str__(self):
        return f"Shot for {self.project.slug}"

    def save(self, *args, **kwargs):
        render_webp(self.image, 1400)
        super().save(*args, **kwargs)


class Logo(models.Model):
    """A client logo. Uploaded once and reused by the sliding strip on /about
    and the scattered chips on the home page CTA."""

    name = models.CharField(
        "Client name", max_length=120,
        help_text="Used to tell logos apart in this admin. It is not shown anywhere on "
                  "the website.")
    image = models.FileField(
        "Logo file", upload_to="logos/",
        validators=[FileExtensionValidator(["svg", "png", "webp", "jpg", "jpeg"])],
        help_text="SVG is best — it stays sharp at any size. Otherwise use a PNG with a "
                  "transparent background. JPEGs work but will show a white box behind "
                  "the logo. Large files are compressed for you.")
    order = models.PositiveIntegerField(
        "Display order", default=0,
        help_text="The order logos appear in the sliding strip on the About page, lowest "
                  "number first.")
    published = models.BooleanField(
        "Published", default=True,
        help_text="Untick to remove this logo from the About page strip and from the home "
                  "page, without deleting it.")

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Client logo"
        verbose_name_plural = "Client logos"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # 400px covers the largest chip (149px) at 2x
        render_webp(self.image, 400)
        super().save(*args, **kwargs)


class CtaChip(models.Model):
    """One scattered logo on the home page CTA. A logo can have more than one —
    CHI currently appears twice, at different sizes and corners."""

    logo = models.ForeignKey(
        Logo, related_name="chips", on_delete=models.CASCADE, verbose_name="Which logo",
        help_text="Pick from the client logos already uploaded. The same logo can be placed "
                  "more than once — add another entry for each position.")
    size = models.PositiveSmallIntegerField(
        "Size", default=100,
        help_text="How large the logo appears, in pixels. The current ones range from 74 "
                  "to 149. Larger logos read as closer to the viewer.")
    x = models.SmallIntegerField(
        "Position across",
        help_text="How far across the section, as a percentage. 0 is the far left edge, "
                  "100 the far right. Keep clear of 35 to 65 — the heading and button sit there.")
    y = models.SmallIntegerField(
        "Position down",
        help_text="How far down the section, as a percentage. 0 is the top edge, 100 the "
                  "bottom. A negative number lifts it above the top edge so it is only "
                  "partly visible.")
    rot = models.SmallIntegerField(
        "Tilt", default=0,
        help_text="Tilt in degrees. A negative number leans left, positive leans right. "
                  "Between -10 and 10 looks natural; more starts to look like a mistake.")
    order = models.PositiveIntegerField(
        "Display order", default=0,
        help_text="Lowest number first. Only affects which is drawn on top when two overlap.")

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Home page floating logo"
        verbose_name_plural = "Home page floating logos"

    def __str__(self):
        return f"{self.logo.name} chip at {self.x},{self.y}"


class ContactMessage(models.Model):
    """Every contact form submission, stored before the email is attempted — a
    Graph outage or an expired secret must not lose an enquiry."""

    name = models.CharField("Name", max_length=120)
    company = models.CharField("Company", max_length=160)
    email = models.EmailField("Email")
    phone = models.CharField("Phone", max_length=40, blank=True)
    message = models.TextField("Message")

    received = models.DateTimeField("Received", auto_now_add=True)
    sent = models.BooleanField(
        "Emailed", default=False,
        help_text="Ticked once the enquiry has been emailed on successfully.")
    error = models.TextField(
        "Delivery error", blank=True,
        help_text="Why the email could not be sent, if it could not. The enquiry itself "
                  "is still safely stored here.")

    class Meta:
        ordering = ["-received"]
        verbose_name = "Contact enquiry"
        verbose_name_plural = "Contact enquiries"

    def __str__(self):
        return f"{self.name} ({self.company})"


class Faq(models.Model):
    """One row of the expanding list in the "That's not all." section on the
    services page. The frontend uses the primary key for the accordion's element
    ids, so there is nothing slug-like for an editor to fill in."""

    title = models.CharField(
        "Heading", max_length=160,
        help_text="The line a visitor sees before they open the row, for example "
                  "\"Community management\". Keep it to a few words — it sits on one line.")
    body = models.TextField(
        "Details",
        help_text="What is revealed when the row is opened. Two or three sentences. "
                  "Plain text only — no headings or bullet points.")
    order = models.PositiveIntegerField(
        "Display order", default=0,
        help_text="Rows are listed lowest number first.")
    published = models.BooleanField(
        "Published", default=True,
        help_text="Untick to hide this row from the services page without deleting it.")

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "FAQ item"
        verbose_name_plural = "Services page FAQ"

    def __str__(self):
        return self.title


class Stat(models.Model):
    project = models.ForeignKey(Project, related_name="stats", on_delete=models.CASCADE)
    value = models.CharField(
        "Number", max_length=40,
        help_text="The figure itself, for example \"10,000+\" or \"100x\" or \"9 mo\". "
                  "It counts up when the visitor scrolls to it.")
    label = models.CharField(
        "What it means", max_length=80,
        help_text="A short caption under the number, for example \"Followers in nine "
                  "months\". Around three to five words.")
    order = models.PositiveIntegerField(
        "Display order", default=0,
        help_text="Lowest number appears leftmost.")

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Result number"
        verbose_name_plural = "Result numbers"

    def __str__(self):
        return f"{self.value} — {self.label}"
