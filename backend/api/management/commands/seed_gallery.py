import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from api.models import GalleryImage

PUBLIC = settings.BASE_DIR.parent / "frontend" / "public"

GALLERY = [
    ("/gallery/01.webp", "On location with the crew"),
    ("/gallery/02.webp", "Reviewing materials in the studio"),
    ("/gallery/03.webp", "Shooting social content"),
    ("/gallery/04.webp", "In the print studio"),
    ("/gallery/05.webp", "Product and packaging still life"),
    ("/gallery/06.webp", "The studio floor"),
    ("/gallery/07.webp", "Lettering and craft on the desk"),
    ("/gallery/08.webp", "Two designers going through prints"),
    ("/gallery/09.webp", "Typography and layout reference"),
]


def store(path):
    """Copy /gallery/01.webp out of the frontend into MEDIA_ROOT."""
    src = PUBLIC / path.lstrip("/")
    if not src.exists():
        return ""
    rel = Path("gallery") / src.name
    dst = Path(settings.MEDIA_ROOT) / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
    return str(rel)


class Command(BaseCommand):
    help = "Load the services page gallery strip that used to live in site.js"

    def handle(self, *args, **options):
        for i, (path, alt) in enumerate(GALLERY):
            stored = store(path)
            if not stored:
                self.stdout.write(self.style.WARNING(f"missing file for {alt}, skipped"))
                continue
            item, _ = GalleryImage.objects.update_or_create(
                alt=alt, defaults={"image": stored, "order": i},
            )
            self.stdout.write(self.style.SUCCESS(f"gallery {item.alt}"))
