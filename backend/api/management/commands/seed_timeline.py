import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from api.models import Milestone

PUBLIC = settings.BASE_DIR.parent / "frontend" / "public"

# lifted from TIMELINE in frontend/src/content/site.js
MILESTONES = [
    (2019, "One room in Lagos",
     "The Creative Sphere opens with a small team and a single idea: strategy, design "
     "and story in one room instead of three agencies.",
     "/timeline/2019.webp", "The studio floor in its first year"),
    (2021, "Onto the shelf",
     "CHI Limited puts the work in front of a national audience. Chivita and "
     "Capri-Sonne campaigns are shot, cut and shipped in house.",
     "/timeline/2021.webp", "A campaign shoot in progress on set"),
    (2023, "Into the app",
     "VFD Microfinance Bank and Dash MFB move the work onto screens, where a brand has "
     "to earn trust in the first ten seconds.",
     "/timeline/2023.webp", "Interface design being worked through on screen"),
    (2025, "Eight industries in",
     "Insurance, clean energy, logistics, art. The studio moves between sectors now "
     "without changing how it works.",
     "/timeline/2025.webp", "The studio at work across several projects"),
]


def store(path):
    """Copy /timeline/2019.webp out of the frontend into MEDIA_ROOT."""
    src = PUBLIC / path.lstrip("/")
    if not src.exists():
        return ""
    rel = Path("timeline") / src.name
    dst = Path(settings.MEDIA_ROOT) / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
    return str(rel)


class Command(BaseCommand):
    help = "Load the About page timeline that used to live in site.js"

    def handle(self, *args, **options):
        for year, title, body, path, alt in MILESTONES:
            stored = store(path)
            if not stored:
                self.stdout.write(self.style.WARNING(f"missing file for {year}, skipped"))
                continue
            milestone, _ = Milestone.objects.update_or_create(
                year=year,
                defaults={"title": title, "body": body, "image": stored, "alt": alt},
            )
            self.stdout.write(self.style.SUCCESS(f"milestone {milestone.year} {milestone.title}"))
