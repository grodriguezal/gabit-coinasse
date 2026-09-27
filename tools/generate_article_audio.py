#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import re
import subprocess
import tempfile
from pathlib import Path

from bs4 import BeautifulSoup
from melo.api import TTS
from pydub import AudioSegment


def clean_text(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"\s+", " ", value).strip()
    replacements = {
        "EE.UU.": "Estados Unidos",
        "EE. UU.": "Estados Unidos",
        "IA": "inteligencia artificial",
        "BIS": "B I S",
        "SEC": "S E C",
        "M2": "M dos",
        "Treasuries": "bonos del Tesoro estadounidense",
        "stablecoins": "monedas estables",
        "blockchain": "blockchain",
        "onchain": "en cadena",
        "nonprofits": "organizaciones sin ánimo de lucro",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"\$(\d[\d.,]*)", r"\1 dólares", value)
    value = value.replace("%", " por ciento")
    value = value.replace("→", ", luego ")
    value = value.replace("↗", "")
    return re.sub(r"\s+", " ", value).strip()


def extract_sections(article_path: Path) -> list[tuple[str, str]]:
    soup = BeautifulSoup(article_path.read_text(encoding="utf-8"), "html.parser")
    body = soup.select_one(".article-body")
    if not body:
        raise RuntimeError("No se encontró .article-body")

    sections: list[tuple[str, str]] = []
    title = soup.select_one(".article-hero h1")
    deck = soup.select_one(".article-deck")
    if title:
        sections.append(("title", clean_text(title.get_text(" ", strip=True))))
    if deck:
        sections.append(("deck", clean_text(deck.get_text(" ", strip=True))))

    for node in body.select("h2, p, .takeaway h3"):
        if node.find_parent(class_="article-sources") or node.find_parent(class_="article-thread") or node.find_parent(class_="content-diagram"):
            continue
        classes = set(node.get("class") or [])
        if "block-label" in classes or "article-disclaimer" in classes:
            continue
        text = clean_text(node.get_text(" ", strip=True))
        if not text:
            continue
        kind = "heading" if node.name == "h2" else "takeaway" if node.find_parent(class_="takeaway") else "paragraph"
        sections.append((kind, text))
    return sections


def split_text(text: str, max_chars: int = 420) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        candidate = f"{current} {sentence}".strip()
        if current and len(candidate) > max_chars:
            chunks.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks


def render(article: Path, output: Path, speed: float) -> None:
    sections = extract_sections(article)
    if not sections:
        raise RuntimeError("No se encontró contenido narrable")

    print(f"Narrando {len(sections)} bloques con MeloTTS ES a velocidad {speed}")
    model = TTS(language="ES", device="cpu")
    speaker_ids = model.hps.data.spk2id
    speaker_id = speaker_ids["ES"]

    final_audio = AudioSegment.silent(duration=220)
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        part_index = 0
        for kind, text in sections:
            chunks = split_text(text)
            for chunk in chunks:
                wav_path = tmp / f"part-{part_index:04d}.wav"
                model.tts_to_file(chunk, speaker_id, str(wav_path), speed=speed)
                segment = AudioSegment.from_wav(wav_path)
                final_audio += segment
                if kind in {"title", "heading"}:
                    final_audio += AudioSegment.silent(duration=620)
                elif kind == "takeaway":
                    final_audio += AudioSegment.silent(duration=520)
                else:
                    final_audio += AudioSegment.silent(duration=330)
                part_index += 1

    output.parent.mkdir(parents=True, exist_ok=True)
    final_audio.export(output, format="mp3", bitrate="96k")
    print(f"MP3 generado: {output} ({output.stat().st_size / 1024 / 1024:.1f} MB)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("article", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--speed", type=float, default=0.94)
    args = parser.parse_args()
    render(args.article, args.output, args.speed)


if __name__ == "__main__":
    main()
