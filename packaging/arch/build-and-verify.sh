#!/usr/bin/env bash
set -euo pipefail

pacman -Syu --noconfirm --needed namcap xorg-server-xvfb
useradd -m builder
install -dm755 -o builder -g builder /tmp/arch-build
cp /work/dist/arch/PKGBUILD /work/dist/clash-party-linux-*-x64.tar.gz /tmp/arch-build/
chown -R builder:builder /tmp/arch-build
runuser -u builder -- bash -c 'cd /tmp/arch-build && makepkg --noconfirm --nodeps && makepkg --printsrcinfo > .SRCINFO'
package=(/tmp/arch-build/*.pkg.tar.zst)
pacman -U --noconfirm "${package[0]}"
pacman -Qk clash-party-cfw-icons-bin
cmp /usr/share/icons/hicolor/256x256/apps/mihomo-party.png /work/build/icon.png
ldd /opt/clash-party/mihomo-party | tee /tmp/arch-ldd.log
if grep -q 'not found' /tmp/arch-ldd.log; then
    exit 1
fi
namcap "${package[0]}" | tee /work/dist/arch/namcap.log

# A headless container cannot exercise a desktop tray. Check that the application
# starts and the bundled Linux core becomes ready in an isolated home directory.
install -dm700 -o builder -g builder /tmp/arch-runtime
set +e
timeout --kill-after=5s 25s xvfb-run -a runuser -u builder -- env XDG_RUNTIME_DIR=/tmp/arch-runtime /usr/bin/clash-party --no-sandbox --disable-gpu > /work/dist/arch/startup.log 2>&1
startup_status=$?
set -e
if [[ $startup_status != 124 && $startup_status != 0 ]]; then
    cat /work/dist/arch/startup.log
    exit "$startup_status"
fi
grep -r 'Core ready' /home/builder/.config
cp "${package[0]}" /work/dist/
cp /tmp/arch-build/.SRCINFO /work/dist/arch/
tar -czf /work/dist/clash-party-cfw-icons-bin-PKGBUILD.tar.gz -C /work/dist/arch PKGBUILD .SRCINFO
