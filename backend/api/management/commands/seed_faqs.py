from django.core.management.base import BaseCommand

from api.models import Faq

# lifted from EXTRAS in frontend/src/content/site.js
FAQS = [
    ("Influencer campaigns",
     "One coordinated push — fifty nano-influencers briefed, scheduled and managed as a "
     "single campaign voice, so the message lands the same way whoever is saying it."),
    ("Community management",
     "Day-to-day custody of the comment section, the DMs and the replies. We handled "
     "community for Prudential Zenith, where tone under pressure is the whole job."),
    ("Retail & experiential activation",
     "Campaign work for CHI Limited — Chivita and Capri-Sonne — took us into national "
     "retail activation, turning a brand idea into something people meet in person."),
    ("Photography & video production",
     "Shoots planned around the edit and the platform, not the other way round. One "
     "production run feeds the campaign film, the cutdowns and the stills."),
    ("Brand management",
     "Ongoing custody of a brand once the identity is built — guardrails, asset libraries "
     "and the judgement calls that keep it consistent as it grows."),
    ("Social growth & reporting",
     "We took VFD Bank’s X account from roughly 100 followers to over 10,000 in nine "
     "months, and reported on what actually moved rather than what looked good."),
]


class Command(BaseCommand):
    help = "Load the services page FAQ rows that used to live in site.js"

    def handle(self, *args, **options):
        for i, (title, body) in enumerate(FAQS):
            faq, _ = Faq.objects.update_or_create(
                title=title, defaults={"body": body, "order": i},
            )
            self.stdout.write(self.style.SUCCESS(f"faq {faq.title}"))
