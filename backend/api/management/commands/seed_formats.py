import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from api.models import Format

PUBLIC = settings.BASE_DIR.parent / "frontend" / "public"

# lifted from FORMATS in frontend/src/content/site.js
FORMATS = [
    ("/format/1-campaign.webp", "Campaign film in production"),
    ("/format/2-system.webp", "Campaign frames laid out as a system"),
    ("/format/3-identity.webp", "Printed identity, stacked and checked"),
    ("/format/4-social.webp", "Social content being filmed"),
    ("/format/5-product.webp", "Packaging shot in the studio"),
]


def store(path):
    """Copy /format/1-campaign.webp out of the frontend into MEDIA_ROOT."""
    src = PUBLIC / path.lstrip("/")
    if not src.exists():
        return ""
    rel = Path("format") / src.name
    dst = Path(settings.MEDIA_ROOT) / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
    return str(rel)


class Command(BaseCommand):
    help = "Load the home page carousel images that used to live in site.js"

    def handle(self, *args, **options):
        for i, (path, alt) in enumerate(FORMATS):
            stored = store(path)
            if not stored:
                self.stdout.write(self.style.WARNING(f"missing file for {alt}, skipped"))
                continue
            fmt, _ = Format.objects.update_or_create(
                alt=alt, defaults={"image": stored, "order": i},
            )
            self.stdout.write(self.style.SUCCESS(f"format {fmt.alt}"))
