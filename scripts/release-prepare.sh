#!/bin/sh
# tagpr の postVersionCommand。共通の tagpr workflow が artifact を TAGPR_ARTIFACT_DIR で
# 渡すことを確かめる（取り込み先のラッパーと同じ形: 検査を済ませてから書く）。
set -eu

if [ ! -f "${TAGPR_ARTIFACT_DIR:-}/CREDITS" ]; then
    echo "TAGPR_ARTIFACT_DIR must hold CREDITS, got \"${TAGPR_ARTIFACT_DIR:-}\"" >&2
    exit 1
fi

# npm パッケージなので、package-lock.json の版も揃える（--changelog-only を付けない）
node scripts/tagpr/release-prepare.mjs
cp "$TAGPR_ARTIFACT_DIR/CREDITS" CREDITS
