"""The showcase score: 120 bpm, 30 s, every hit on a cut. Synthesised so it is deterministic and licence-free."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt, lfilter

SR = 48000; BPM = 120; BEAT = 60 / BPM; BAR = BEAT * 4; DUR = 30.0
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

# harmony: D minor, Dm Bb F C, a chord a bar
CH = [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [41, 53, 57, 60, 65], [48, 55, 60, 64, 67]]
ROOT = [38, 34, 41, 36]
def ch(t): return int(t / BAR) % 4

# ---------- 0 to 2: rain, typing, rise into the hit
rain = filt(rng.standard_normal(int(2.2 * SR)), 'bandpass', [1500, 7000]) * .09
rain *= np.linspace(.3, 1, len(rain)); add(rain, 0, 0, 1, False)
for i in range(16):
    if i < 11 or 16 <= i: tick(.1 + i * BEAT / 4 * .72, .11)
for i in range(14): tick(1.0 + i * .03, .09)
riser(.6, 1.4, .2)
for i, m in enumerate([74, 77, 81, 84]): pluck(m, 1.0 + i * BEAT / 2, .05, -.4 + i * .25, 7)
# ---------- 2: the hit, the drop settles on eighths
impact(2.0, .95)
for i, m in enumerate([62, 65, 69, 74, 77]): pluck(m, 2.0 + i * .25, .16, -.5 + i * .25, 4, 1.3)
pad(CH[0], 2.0, 2.0, .05, 1200)
roll(3.0, 4.0, .18); riser(3.0, 1.0, .18, 600, 12000)
# ---------- 4 to 12: the groove
WORD = [[62, 69, 74], [58, 65, 70], [57, 65, 72], [60, 67, 76]]
for b in range(int(4 / BEAT), int(12 / BEAT)):
    st = b * BEAT; kick(st); hat(st + BEAT / 2, .1, True)
    if b % 2: clap(st)
    if st >= 8:
        hat(st + BEAT / 4, .05); hat(st + 3 * BEAT / 4, .05)
    c = ch(st); bass(ROOT[c] + (12 if b % 4 == 3 else 0), st + BEAT / 2, BEAT / 2 * .9)
    bass(ROOT[c], st + BEAT * .25 if b % 4 == 2 else st + 99, BEAT / 4)
for i, (t0, notes) in enumerate(zip([4, 4.5, 5, 5.5], WORD)): stab(notes, t0, .2)
stab([62, 65, 69, 74], 6.0, .12, .2, 2500); stab([60, 64, 67, 72], 7.0, .22, .4, 7000)
for i in range(8): pluck([74, 77, 81, 77, 74, 72, 74, 77][i], 6.0 + i * .125, .06, -.3 + .1 * i, 8)
whoosh(8.0); whoosh(12.0, .2)
for i in range(4): stab([62, 69, 74] if i < 2 else [58, 65, 70], 8 + i * .125, .1, .1, 3000)
# arp through the colour meanings
ARP = [[74, 77, 81, 86], [70, 74, 77, 82], [69, 72, 77, 81], [72, 76, 79, 84]]
for i in range(int(3.5 / (BEAT / 4))):
    st = 8.5 + i * BEAT / 4; pluck(ARP[ch(st)][i % 4], st, .045, (-.5, .5)[i % 2], 9)
for t0 in [9.0, 9.5, 10.0, 10.5, 11.0]: stab(CH[ch(t0)][1:4], t0, .13, .18, 3500)
stab([65, 69, 74], 11.5, .16); stab([64, 67, 72], 11.75, .14)
# ---------- 12 to 14: breakdown, weight sweep, mono count, rise
pad([50, 57, 62, 65, 69], 12.0, 2.0, .09, 1600)
for i in range(8): pluck(86 - (i % 4) * 2, 12.0 + i * BEAT / 2, .04, 0, 8)
for i in range(24): tick(13.0 + i * .025, .05)
riser(12.5, 1.5, .26, 200, 14000); roll(13.0, 14.0, .22)
for b in range(int(12 / BEAT), int(13 / BEAT)): hat(b * BEAT + BEAT / 2, .06, True)
# ---------- 14 to 18: the range
impact(14.0, .85); whoosh(14.0)
for b in range(int(14 / BEAT), int(26 / BEAT)):
    st = b * BEAT
    if 25.75 <= st: continue
    kick(st); hat(st + BEAT / 2, .11, True); hat(st + BEAT / 4, .05); hat(st + 3 * BEAT / 4, .05)
    if b % 2: clap(st, .38)
    if not (18 <= st < 20) or st >= 19:
        c = ch(st); bass(ROOT[c] + (12 if b % 4 == 3 else 0), st + BEAT / 2, BEAT / 2 * .9, .34)
PRODN = [[62, 69, 74], [65, 72, 77], [62, 69, 74], [60, 67, 72], [58, 65, 70], [57, 64, 69]]
for i, notes in enumerate(PRODN): stab(notes, 14 + i * BEAT, .19, .25, 6000)
for j in range(15): pluck([74, 77, 79, 81, 84][j % 5] + (12 if j > 9 else 0), 17 + j * .03125, .05, -.6 + j * .08, 10)
impact(17.5, .6); stab([62, 69, 74, 77], 17.5, .22, .5, 8000)
# ---------- 18 to 20: five inlets, one outlet
for i, m in enumerate([69, 72, 74, 77, 79]): bell(m + 12, 18.5 + i * .25, .13, -.5 + i * .25)
bell(86, 19.75, .2, 0); bell(74, 19.75, .1, 0)
whoosh(18.0, .14)
# ---------- 20 to 22: the dive
t = tt(1.8); f = 400 * (40 / 400) ** (t / 1.8); ph = 2 * np.pi * np.cumsum(f) / SR
add(np.sin(ph) * np.linspace(1, .3, len(t)) * .22, 20.0, 0, 1, False)
roll(21.0, 22.0, .2); riser(21.0, 1.0, .16, 500, 10000)
# ---------- 22 to 24: a cut every eighth
for i in range(8): stab(CH[ch(22 + i * .25)][2:5], 22 + i * .25, .1, .1, 4500 + i * 300)
# ---------- 24 to 26: the suite
for j in range(12): pluck([81, 84, 86, 89][j % 4], 24 + j * .0625, .05, -.6 + j * .1, 10)
stab([65, 69, 72], 25.0, .16, .2); stab([67, 71, 74], 25.5, .16, .2)
roll(25.0, 25.75, .22); riser(24.5, 1.5, .26, 300, 15000)
# ---------- 26 to 30: the lockup
impact(26.0, 1.0)
t = tt(3.0); f = 55 * np.exp(-t * .5); ph = 2 * np.pi * np.cumsum(f) / SR; add(np.sin(ph) * np.exp(-t * .9) * .5, 26.0, 0, 1, False)
for i, m in enumerate([62, 65, 69, 74, 77]): pluck(m + 12, 26.0 + i * .1, .12, -.4 + i * .2, 3.5, 1.2)
for i in range(14): pluck([86, 89, 93, 98][i % 4], 26.75 + i * .05, .035, -.7 + i * .1, 9)
pad([41, 53, 57, 60, 65, 69], 26.0, 3.3, .11, 3000)
stab([65, 69, 72, 77], 27.75, .14, .6, 6000); bell(89, 27.75, .1, 0)

# ---------- master
out = filt(out.T, 'highpass', 28).T if False else out
for c in range(2): out[:, c] = filt(out[:, c], 'highpass', 25)
peak = np.max(np.abs(out)); out = np.tanh(out / peak * 1.9) * .9
fl = int(1.0 * SR); out[-fl:] *= np.linspace(1, 0, fl)[:, None]
pcm = (out * 32767).astype(np.int16)
dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'score.wav')
with wave.open(dest, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', dest)
