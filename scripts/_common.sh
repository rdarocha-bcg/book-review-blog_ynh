#!/bin/bash

# Node.js version used to build the Angular app
nodejs_version=20

# Directory containing packaging scripts (this file lives in scripts/)
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repository / package root (manifest.toml, conf/, doc/)
pkg_dir="$(cd "$script_dir/.." && pwd)"

# Classic *_ynh layout: sources/ next to scripts/. Monorepo: app root is pkg_dir.
if [ -f "$pkg_dir/sources/package.json" ]; then
    app_source_dir="$pkg_dir/sources"
else
    app_source_dir="$pkg_dir"
fi

# Copy application tree into $1 (build staging). Excludes packaging and heavy artifacts.
ynh_copy_app_sources() {
    local dest="$1"
    mkdir -p "$dest"
    if ! command -v rsync >/dev/null 2>&1; then
        ynh_die "rsync is required to copy application sources"
    fi
    rsync -a \
        --exclude '.git/' \
        --exclude 'node_modules/' \
        --exclude 'dist/' \
        --exclude '.angular/' \
        --exclude 'scripts/' \
        --exclude 'conf/' \
        --exclude 'doc/' \
        --exclude 'yunohost/' \
        --exclude 'playwright-report/' \
        --exclude 'test-results/' \
        --exclude 'coverage/' \
        --exclude '.tools/' \
        --exclude '.cursor/' \
        --exclude 'manifest.toml' \
        --exclude 'tests.toml' \
        "$app_source_dir/" "$dest/"
}
