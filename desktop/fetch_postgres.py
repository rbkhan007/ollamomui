import sys
import urllib.request
import zipfile
from pathlib import Path


VERSION = "16.4"
CANDIDATES = [
    f"https://get.enterprisedb.com/postgresql/postgresql-{VERSION}-1-windows-x64-binaries.zip",
    f"https://ftp.postgresql.org/pub/binary/v{VERSION}/windows-x64/postgresql-{VERSION}-1-windows-x64-binaries.zip",
]

TARGET = Path(__file__).resolve().parent / "postgres"


def download(url: str, dest: Path):
    tmp = dest.parent / "postgres-binaries.zip"
    print(f"Downloading {url}")
    with urllib.request.urlopen(url) as resp, open(tmp, "wb") as fh:
        total = int(resp.headers.get("Content-Length", 0) or 0)
        done = 0
        chunk = 1024 * 256
        while True:
            block = resp.read(chunk)
            if not block:
                break
            fh.write(block)
            done += len(block)
            if total:
                pct = done * 100 // total
                sys.stdout.write(f"\r  {pct}% ({done // 1024 // 1024} MB)")
                sys.stdout.flush()
    print()
    return tmp


def extract(zippath: Path, target: Path):
    target.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zippath) as zf:
        zf.extractall(target)
    pgsql = target / "pgsql"
    if pgsql.exists() and not (target / "bin").exists():
        for item in pgsql.iterdir():
            dest = target / item.name
            if dest.exists():
                if dest.is_dir():
                    import shutil
                    shutil.rmtree(dest)
                else:
                    dest.unlink()
            item.rename(dest)
        pgsql.rmdir()
    zippath.unlink()


def main():
    TARGET.mkdir(parents=True, exist_ok=True)
    if (TARGET / "bin" / "postgres.exe").exists():
        print("PostgreSQL binaries already present in desktop/postgres")
        return
    last = None
    for url in CANDIDATES:
        try:
            zippath = download(url, TARGET)
            extract(zippath, TARGET)
            print(f"PostgreSQL binaries installed to {TARGET}")
            return
        except Exception as exc:
            last = exc
            print(f"  failed: {exc}")
    print(f"Could not download PostgreSQL binaries: {last}")
    sys.exit(1)


if __name__ == "__main__":
    main()
