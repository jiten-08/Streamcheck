from django.db import migrations


VIDEO_SOURCES = {
    "eclipse-protocol": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "neon-horizon": "https://media.w3.org/2010/05/sintel/trailer.mp4",
    "the-last-signal": "https://media.w3.org/2010/05/bunny/trailer.mp4",
    "arcadia": "https://media.w3.org/2010/05/video/movie_300.mp4",
    "zero-hour": "https://media.w3.org/2010/05/bunny/movie.mp4",
    "velvet-night": "https://samplelib.com/mp4/sample-5s.mp4",
    "afterlight": "https://samplelib.com/mp4/sample-10s.mp4",
    "static-dreams": "https://samplelib.com/mp4/sample-15s.mp4",
    "northstar": "https://samplelib.com/mp4/sample-20s.mp4",
    "redline": "https://samplelib.com/mp4/sample-30s.mp4",
    "echo-lake": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?title=echo-lake",
    "paper-kingdom": "https://media.w3.org/2010/05/sintel/trailer.mp4?title=paper-kingdom",
    "black-tides": "https://media.w3.org/2010/05/bunny/trailer.mp4?title=black-tides",
    "golden-state": "https://media.w3.org/2010/05/video/movie_300.mp4?title=golden-state",
    "memory-lane": "https://media.w3.org/2010/05/bunny/movie.mp4?title=memory-lane",
    "tiny-giants": "https://samplelib.com/mp4/sample-5s.mp4?title=tiny-giants",
    "cold-case": "https://samplelib.com/mp4/sample-10s.mp4?title=cold-case",
    "firebreak": "https://samplelib.com/mp4/sample-15s.mp4?title=firebreak",
}


def seed_video_urls(apps, schema_editor):
    Movie = apps.get_model("catalog", "Movie")
    for slug, video_url in VIDEO_SOURCES.items():
        Movie.objects.filter(slug=slug).update(video_url=video_url)


def clear_seed_video_urls(apps, schema_editor):
    Movie = apps.get_model("catalog", "Movie")
    Movie.objects.filter(slug__in=VIDEO_SOURCES).update(video_url="")


class Migration(migrations.Migration):
    dependencies = [("catalog", "0005_movie_video_url")]
    operations = [migrations.RunPython(seed_video_urls, clear_seed_video_urls)]
