import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from api.models import CtaChip, Logo

PUBLIC = settings.BASE_DIR.parent / "frontend" / "public"

# lifted from LOGOS in frontend/src/content/site.js
LOGOS = [
    ("CHI Nigeria", "/logos/chi.webp"),
    ("VFD / Vbank", "/logos/vfd.webp"),
    ("Dash MFB", "/logos/dash.jpg"),
    ("Aurora", "/logos/aurora.webp"),
    ("Prudential Zenith Life", "/logos/prudential.webp"),
    ("ESVolt", "/logos/esvolt.webp"),
    ("Acacia Solicitors", "/logos/acacia-solicitors.svg"),
]

# lifted from CTA_LOGOS — (logo name, size, x, y, rot). CHI appears twice.
CHIPS = [
    ("CHI Nigeria", 133, 10, -4, -8),
    ("VFD / Vbank", 85, 27, 42, 6),
    ("Dash MFB", 78, 4, 62, -5),
    ("Aurora", 74, 22, 78, 9),
    ("Prudential Zenith Life", 133, 78, 6, 7),
    ("ESVolt", 149, 86, 46, -6),
    ("Acacia Solicitors", 78, 70, 40, -10),
    ("CHI Nigeria", 78, 73, 76, 5),
]


def store(path):
    """Copy /logos/chi.webp out of the frontend into MEDIA_ROOT, return 'logos/chi.webp'."""
    src = PUBLIC / path.lstrip("/")
    if not src.exists():
        return ""
    rel = Path("logos") / src.name
    dst = Path(settings.MEDIA_ROOT) / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
    return str(rel)


class Command(BaseCommand):
    help = "Load the client logos and CTA chips that used to live in site.js"

    def handle(self, *args, **options):
        for i, (name, path) in enumerate(LOGOS):
            stored = store(path)
            if not stored:
                self.stdout.write(self.style.WARNING(f"missing file for {name}, skipped"))
                continue
            logo, _ = Logo.objects.update_or_create(
                name=name, defaults={"image": stored, "order": i},
            )
            self.stdout.write(self.style.SUCCESS(f"logo {logo.name}"))

        CtaChip.objects.all().delete()
        for i, (name, size, x, y, rot) in enumerate(CHIPS):
            logo = Logo.objects.filter(name=name).first()
            if not logo:
                continue
            CtaChip.objects.create(logo=logo, size=size, x=x, y=y, rot=rot, order=i)

        self.stdout.write(self.style.SUCCESS(f"{CtaChip.objects.count()} CTA chips"))
