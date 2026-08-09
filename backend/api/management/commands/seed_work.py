import json
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from api.models import Project, Shot, Stat

PUBLIC = settings.BASE_DIR.parent / "frontend" / "public"


def store(path):
    """Copy /work/vfd.webp out of the frontend into MEDIA_ROOT, return 'work/vfd.webp'."""
    if not path:
        return ""
    src = PUBLIC / path.lstrip("/")
    if not src.exists():
        return ""
    rel = Path("work") / src.name
    dst = Path(settings.MEDIA_ROOT) / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
    return str(rel)


class Command(BaseCommand):
    help = "Load the projects dumped out of frontend/src/content/site.js"

    def add_arguments(self, parser):
        parser.add_argument("--file", default=str(settings.BASE_DIR / "seed" / "work.json"))

    def handle(self, *args, **options):
        items = json.loads(Path(options["file"]).read_text())

        for i, item in enumerate(items):
            project, _ = Project.objects.update_or_create(
                slug=item["id"],
                defaults={
                    "client": item["client"],
                    "title": item["title"],
                    "line": item["line"],
                    "year": item["year"],
                    "sector": item["sector"],
                    "disciplines": ", ".join(item["disciplines"]),
                    "scope": ", ".join(item["scope"]),
                    "brief": item["brief"],
                    "approach": item["approach"],
                    "outcome": item["outcome"],
                    "card": store(item["img"]),
                    "hero": store(item["hero"]),
                    "thumb": store(f"/work/t-{item['id']}.webp"),
                    "start": item["start"],
                    "span": item["span"],
                    "row": item["row"],
                    "off": item["off"],
                    "order": i,
                },
            )

            project.shots.all().delete()
            for n, shot in enumerate(item["shots"]):
                stored = store(shot)
                if stored:
                    Shot.objects.create(project=project, image=stored, order=n)

            project.stats.all().delete()
            for n, stat in enumerate(item["stats"] or []):
                Stat.objects.create(project=project, value=stat["v"], label=stat["l"], order=n)

            self.stdout.write(self.style.SUCCESS(f"seeded {project.slug}"))
