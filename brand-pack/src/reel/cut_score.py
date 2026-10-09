"""The 3D cut score: 90 bpm, 20 s, calm. Synthesised so it is deterministic and licence-free."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt, lfilter

SR = 48000; BPM = 90; BEAT = 60 / BPM; BAR = BEAT * 4; DUR = 20.0
N = int(SR * DUR)
out = np.zeros((N, 2)); duck = np.ones(N)
rng = np.random.default_rng(2026)

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def add(sig, start, pan=0.0, gain=1.0, ducked=True):
    i = int(round(start * SR))
    if i >= N or i + len(sig) <= 0: return
    a = max(0, -i); i = max(0, i); j = min(N, i + len(sig) - a)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    s = sig[a:a + j - i] * gain
    if ducked: s = s * duck[i:j]
    out[i:j, 0] += s * l; out[i:j, 1] += s * r
def filt(sig, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos'); return sosfilt(sos, sig)
def saw(f, t, ph=0.0):
    # band-limited-ish saw: additive up to 10 kHz
    s = np.zeros_like(t); k = 1
    while k * f < 10000 and k < 60: s += np.sin(2 * np.pi * k * f * t + ph * k) / k; k += 1
    return s * .6
def env(n, a, r):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.arange(n) / SR / r); return e

# ---------- drums
def kick(st, g=.9):
    t = tt(.45); f = 48 + 110 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 6.5); s[:300] += rng.standard_normal(300) * np.linspace(.5, 0, 300)
    add(np.tanh(s * 1.6), st, 0, g, ducked=False)
    # sidechain: duck everything else after each kick
    i = int(st * SR); n = int(.22 * SR); j = min(N, i + n)
    if i < N: duck[i:j] = np.minimum(duck[i:j], .25 + .75 * (np.arange(j - i) / n) ** 1.6)
def clap(st, g=.35):
    s = np.zeros(int(.3 * SR))
    for o in (0, .011, .022):
        i = int(o * SR); n = len(s) - i; s[i:] += rng.standard_normal(n) * np.exp(-np.arange(n) / SR * (60 if o < .02 else 14))
    add(filt(s, 'bandpass', [900, 3800]), st, rng.uniform(-.1, .1), g, ducked=False)
def hat(st, g=.08, open_=False):
    n = int((.22 if open_ else .05) * SR); s = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * (14 if open_ else 70))
    add(filt(s, 'highpass', 7000), st, rng.uniform(-.35, .35), g)
def snare(st, g=.25):
    t = tt(.2); s = rng.standard_normal(len(t)) * np.exp(-t * 22) * .8 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    add(filt(s, 'highpass', 300), st, 0, g, ducked=False)
def impact(st, g=1.0):
    t = tt(2.5); f = 32 + 60 * np.exp(-t * 6); ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-t * 1.4)
    crash = filt(rng.standard_normal(len(t)), 'highpass', 2500) * np.exp(-t * 2.2) * .45
    add(np.tanh(boom * 1.5) * .9 + crash, st, 0, g, ducked=False)
def riser(st, d, g=.22, f0=300, f1=9000):
    n = int(d * SR); s = rng.standard_normal(n); y = np.zeros(n); blk = 1024
    for b in range(0, n, blk):
        k = b / n; fc = f0 * (f1 / f0) ** k
        y[b:b + blk] = filt(s[b:b + blk], 'bandpass', [fc * .7, min(fc * 1.4, 20000)], 1)
    y *= np.linspace(0, 1, n) ** 2; add(y, st, 0, g, ducked=False)
def whoosh(st, g=.18):
    n = int(.35 * SR); s = rng.standard_normal(n); y = np.zeros(n)
    for b in range(0, n, 512): k = b / n; fc = 400 + 6000 * np.sin(np.pi * k); y[b:b + 512] = filt(s[b:b + 512], 'bandpass', [fc * .6, fc * 1.5], 1)
    y *= np.sin(np.pi * np.linspace(0, 1, n)); add(y, st - .18, 0, g, ducked=False)
def roll(a, b, g=.2):
    t = a
    while t < b:
        k = (t - a) / (b - a); snare(t, g * (.35 + .65 * k)); t += BEAT / (2 if k < .5 else 4 if k < .8 else 8)

# ---------- tonal
def pluck(m, st, g=.12, pan=0.0, dec=5.0, bright=1.0):
    t = tt(1.4); f = hz(m)
    s = (np.sin(2 * np.pi * f * t) + .5 * bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 12) + .25 * bright * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 18)) * np.exp(-t * dec)
    s[:120] *= np.linspace(0, 1, 120); add(s, st, pan, g)
def stab(notes, st, g=.16, d=.32, cutoff=5000):
    t = tt(d + .25); s = np.zeros_like(t)
    for m in notes:
        for det in (-.12, 0, .12): s += saw(hz(m + det), t, rng.uniform(0, 6))
    s = filt(s, 'lowpass', cutoff) / (len(notes) * 3)
    s *= env(len(t), .004, d * .5); add(s, st, 0, g)
    add(s, st + BEAT * .75, .6, g * .25); add(s, st + BEAT * 1.5, -.6, g * .1)  # dotted echo
def bass(m, st, d, g=.32):
    t = tt(d); f = hz(m)
    s = filt(saw(f, t) + .6 * np.sin(2 * np.pi * f / 2 * t), 'lowpass', 900) * env(len(t), .005, d * 1.5)
    s[-400:] *= np.linspace(1, 0, 400); add(np.tanh(s * 1.4), st, 0, g)
def pad(notes, st, d, g=.08, cutoff=2400):
    t = tt(d + 1.0); s = np.zeros_like(t)
    for m in notes:
        for det in (-.1, .1): s += saw(hz(m + det), t, rng.uniform(0, 6))
    s = filt(s, 'lowpass', cutoff) / (len(notes) * 2)
    e = np.ones(len(t)); na = int(.4 * SR); e[:na] = np.linspace(0, 1, na); nr = int(1.0 * SR); e[-nr:] = np.linspace(1, 0, nr)
    add(s * e, st, 0, g)
def bell(m, st, g=.14, pan=0):
    t = tt(2.0); f = hz(m)
    s = (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 3) + .2 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 6)) * np.exp(-t * 2.2)
    s[:100] *= np.linspace(0, 1, 100); add(s, st, pan, g)
def tick(st, g=.05):
    n = int(.03 * SR); s = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 200); add(filt(s, 'bandpass', [2000, 6000]), st, rng.uniform(-.3, .3), g)

# harmony: D minor colour, Dm9 Bbmaj7 Fmaj9 C6, a chord a bar, resolving to F
CH = [[50, 57, 62, 64, 69], [46, 53, 57, 62, 65], [41, 53, 57, 60, 67], [48, 55, 60, 64, 69]]
ROOT = [38, 34, 41, 36]
def ch(t): return int(max(0, t) / (.75 * BAR)) % 4
TR, TS, TE = 2 * BAR, 5 * BAR, 6 * BAR
def softkick(st, g=.5):
    t = tt(.4); f = 44 + 60 * np.exp(-t * 24); ph = 2 * np.pi * np.cumsum(f) / SR
    add(np.sin(ph) * np.exp(-t * 8), st, 0, g, ducked=False)
    i = int(st * SR); n = int(.3 * SR); j = min(N, i + n)
    if i < N: duck[i:j] = np.minimum(duck[i:j], .55 + .45 * (np.arange(j - i) / n))
def shaker(st, g=.03):
    n = int(.07 * SR); s = rng.standard_normal(n) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    add(filt(s, 'bandpass', [5000, 11000]), st, rng.uniform(-.4, .4), g)
def bloom(st, g=.35):
    t = tt(3.0); s = np.sin(2 * np.pi * 36.7 * t) * np.sin(np.pi * np.clip(t / 3, 0, 1)) ** 1.5
    add(s, st, 0, g, ducked=False)
# ---------- intro: a pad from silence, slow drips, a low bloom as the chamber settles in
pad(CH[0], .2, 5.0, .07, 900)
pad([62, 69, 76], 2.0, 3.4, .04, 1800)
bloom(1.3, .3)
drip = [74, 76, 81, 79, 74, 86, 81]
for i, st in enumerate([.6, 1.5, 2.1, 2.9, 3.4, 4.0, 4.6]): pluck(drip[i], st, .05, (-.5, .4, -.2, .6, -.6, .2, 0)[i], 3.5, .6)
riser(3.6, 1.7, .07, 400, 6000)
for i, m in enumerate([62, 65, 69, 74]): pluck(m + 12, 3.2 + i * BEAT / 2, .045, -.3 + i * .2, 4, .8)
# ---------- range: half-time pulse, bass, arpeggio, a chime on each product
for b in range(int(TR / BEAT), int(TS / BEAT)):
    st = b * BEAT
    if b % 2 == 0: softkick(st, .42)
    shaker(st + BEAT / 2, .035); shaker(st, .018)
    if b % 4 == 2: snare(st, .06)
    c = ch(st - TR)
    if b % 4 == 0: bass(ROOT[c], st, BEAT * 1.8, .22)
    if b % 4 == 2: bass(ROOT[c] + 7, st + BEAT / 2, BEAT * .9, .16)
ARP = [[62, 69, 74, 76], [58, 65, 69, 74], [57, 64, 69, 72], [60, 67, 72, 76]]
for i in range(int((TS - TR) / (BEAT / 2))):
    st = TR + i * BEAT / 2; pluck(ARP[ch(st - TR)][i % 4] + 12, st, .04, (-.45, .45)[i % 2], 6, .7)
for j, t0 in enumerate([TR, TR + .75 * BAR, TR + 1.5 * BAR, TR + 2.25 * BAR]):
    bell([81, 79, 77, 76][j], t0, .1, (-.3, .3, -.2, .2)[j]); pad(CH[j], t0, .75 * BAR, .045, 1400)
# ---------- section: the drums fall away, a descending line as the cut sweeps
pad([50, 57, 62, 65, 69], TS, TE - TS + .2, .07, 1100)
for i, m in enumerate([86, 84, 81, 79, 77, 74]): pluck(m, TS + .3 + i * .27, .05, -.4 + i * .16, 4, .7)
t = tt(2.4); f = 220 * (55 / 220) ** (t / 2.4); ph = 2 * np.pi * np.cumsum(f) / SR
add(np.sin(ph) * np.sin(np.pi * t / 2.4) * .08, TS + .2, 0, 1, False)
riser(TE - 1.4, 1.4, .08, 300, 7000)
# ---------- end: a warm hit, the drop settles bottom band first, the wordmark shimmers in, F major
bloom(TE - .05, .4); softkick(TE, .55)
for i, m in enumerate([53, 57, 60, 65, 69]): pluck(m + 12, TE + .1 + i * .14, .1, -.4 + i * .2, 3, 1.0)
for i in range(10): pluck([81, 84, 88, 91][i % 4], TE + 1.2 + i * .05, .03, -.6 + i * .12, 7, .6)
pad([41, 53, 57, 60, 64, 69], TE, DUR - TE - .4, .1, 2200)
bell(84, TE + 2.0, .08, 0); bell(77, TE + 2.0, .05, 0)

# ---------- master
for c in range(2): out[:, c] = filt(out[:, c], 'highpass', 25)
peak = np.max(np.abs(out)); out = np.tanh(out / peak * 1.5) * .85
fl = int(1.4 * SR); out[-fl:] *= np.linspace(1, 0, fl)[:, None]
fi = int(.15 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
pcm = (out * 32767).astype(np.int16)
dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cut_score.wav')
with wave.open(dest, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', dest)
