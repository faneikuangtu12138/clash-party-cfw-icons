#!/usr/bin/env bash
set -euo pipefail
mkdir -p /work/dist/fedora

# Resolve runtime dependencies using only the package's own Requires first.
dnf -y --setopt=install_weak_deps=False install /work/dist/*.rpm
rpm -qi clash-party-cfw-icons-bin
rpm -q --requires clash-party-cfw-icons-bin
rpm --checksig /work/dist/*.rpm
# The upstream post-install script sets the sandbox/core setuid permissions.
rpm -V --nomode clash-party-cfw-icons-bin
test -x /usr/bin/clash-party
test "$(stat -c '%a' /opt/clash-party/chrome-sandbox)" = 4755
ldd /opt/clash-party/mihomo-party | tee /work/dist/fedora/ldd.log
if grep -q 'not found' /work/dist/fedora/ldd.log; then
    exit 1
fi

dnf -y --setopt=install_weak_deps=False install xorg-x11-server-Xvfb xorg-x11-xauth python3-pillow shadow-utils util-linux
python3 - <<'PYTHON'
from PIL import Image
expected = Image.open('/work/build/icon.png').convert('RGBA')
actual = Image.open('/usr/share/icons/hicolor/256x256/apps/mihomo-party.png').convert('RGBA')
assert expected.size == actual.size and expected.tobytes() == actual.tobytes(), 'Desktop icon differs'
print('Verified classic blue gradient desktop icon')
PYTHON

# Verify startup in a temporary user profile; a container has no desktop tray.
useradd -m tester
install -dm700 -o tester -g tester /tmp/fedora-runtime
set +e
timeout --kill-after=5s 25s xvfb-run -a runuser -u tester -- env XDG_RUNTIME_DIR=/tmp/fedora-runtime /usr/bin/clash-party --no-sandbox --disable-gpu > /work/dist/fedora/startup.log 2>&1
startup_status=$?
set -e
if [[ $startup_status != 124 && $startup_status != 0 ]]; then
    cat /work/dist/fedora/startup.log
    exit "$startup_status"
fi
grep -r 'Core ready' /home/tester/.config
dnf -y remove clash-party-cfw-icons-bin
test ! -e /usr/bin/clash-party
printf 'Fedora RPM install, icon, runtime, core startup and removal checks passed.\n'
