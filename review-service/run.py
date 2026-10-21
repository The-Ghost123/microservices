# run.py
# Titik masuk aplikasi: membuat app lewat create_app() lalu menyalakan server.

import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    # HOST bawaannya 127.0.0.1 supaya server hanya bisa diakses dari komputer sendiri.
    # Di dalam Docker nilainya diubah menjadi 0.0.0.0 lewat docker-compose.yml.
    app.run(
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "3002")),
        debug=app.debug,
    )
