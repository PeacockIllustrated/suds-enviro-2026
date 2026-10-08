"""The film score: 100 bpm, 36 s, cuts on the bar. Synthesised so it is deterministic and licence-free."""
import numpy as np, wave, os
SR = 48000; BPM = 100; BEAT = 60 / BPM; BAR = BEAT * 4; DUR = 36.0
N = int(SR * DUR); t = np.arange(N) / SR
out = np.zeros((N, 2))
rng = np.random.default_rng(32)
def env(n, a, d, s, r, sus_len):
    A = np.linspace(0, 1, max(1, int(a * SR))); D = np.linspace(1, s, max(1, int(d * SR)))
    S = np.full(max(0, int(sus_len * SR)), s); R = np.linspace(s, 0, max(1, int(r * SR)))
    e = np.concatenate([A, D, S, R]); return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))
def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    out[i:j, 0] += sig[:j - i] * gain * l; out[i:j, 1] += sig[:j - i] * gain * r
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def pad(notes, start, length, gain=.06):
    n = int((length + 1.5) * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for m in notes:
        for det in (-0.07, 0.07):
            f = hz(m + det); s += np.sin(2 * np.pi * f * tt) + .25 * np.sin(4 * np.pi * f * tt)
    s *= env(n, .9, .5, .8, 1.5, length - 1.4); add(s / len(notes), start, 0, gain)
def pluck(m, start, gain=.12, pan=0.0, dec=6.0):
    n = int(1.2 * SR); tt = np.arange(n) / SR; f = hz(m)
    s = (np.sin(2 * np.pi * f * tt) + .4 * np.sin(2 * np.pi * 2.01 * f * tt) * np.exp(-tt * 9)) * np.exp(-tt * dec)
    s[:200] *= np.linspace(0, 1, 200); add(s, start, pan, gain)
def kick(start, gain=.35):
    n = int(.5 * SR); tt = np.arange(n) / SR
    f = 46 + 70 * np.exp(-tt * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    add(np.sin(ph) * np.exp(-tt * 7), start, 0, gain)
def tick(start, gain=.05):
    n = int(.08 * SR); s = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 60)
    s = np.diff(np.concatenate([[0], s])); add(s, start, rng.uniform(-.4, .4), gain)
# harmony: D minor colour, two bars a chord, resolves to F major for the end card
prog = [[50, 57, 60, 64, 69], [46, 53, 57, 62, 65], [41, 48, 57, 60, 64], [48, 55, 59, 62, 67]]
for b in range(0, 13, 2):
    pad(prog[(b // 2) % 4], b * BAR, BAR * 2)
pad([41, 48, 53, 57, 60, 65], 13 * BAR, DUR - 13 * BAR - .3, gain=.075)
# rain: plucked drips on a deterministic grid of sixteenths, thinning out as the cut opens
scale = [74, 76, 77, 79, 81, 84, 86]
for i in range(int(4 * BAR / (BEAT / 4))):
    st = i * BEAT / 4
    p = .55 if st < 2 * BAR else .55 * (1 - (st - 2 * BAR) / (2 * BAR))
    if rng.random() < p: pluck(scale[rng.integers(len(scale))], st, .05, rng.uniform(-.7, .7), 9)
# pulse: kick on 1 and 3 from the cut, on every beat through the descent
for b in range(int(DUR / BEAT)):
    st = b * BEAT
    if 2 * BAR <= st < 13 * BAR:
        if b % 2 == 0 or 4 * BAR <= st < 7 * BAR: kick(st, .28 if b % 4 == 0 else .18)
        tick(st + BEAT / 2, .03)
# descent: a falling sub line, one note a beat
for i, m in enumerate(range(50, 50 - 12, -1)):
    pluck(m - 12, 4 * BAR + i * BEAT * 0.6, .16, 0, 3)
# plan: one bell per inlet on the beat, outlet a fifth higher on the sixth beat
T_plan = 7 * BAR + .9
for i, m in enumerate([69, 72, 74, 76, 79]): pluck(m, T_plan + i * BEAT, .12, -.5 + i * .25, 4)
pluck(81, T_plan + 5 * BEAT, .15, 0, 2.5)
# x-ray: one low pluck per product
for i, m in enumerate([57, 60, 62, 65]): pluck(m, 9 * BAR + i * BEAT * 2, .12, 0, 3)
# drop: four bands settle bottom first, rising notes, then the wordmark chord
T_drop = 11 * BAR + .2
for i, m in enumerate([53, 57, 60, 65]): pluck(m + 12, T_drop + i * .44, .13, 0, 3.5)
for m in [65, 69, 72]: pluck(m, T_drop + 1.8, .07, 0, 1.6)
# master: gentle compression and fade
out *= 1.0
peak = np.max(np.abs(out)); out = np.tanh(out / peak * 1.4) * .82
fade = np.ones(N); fl = int(.8 * SR); fade[-fl:] = np.linspace(1, 0, fl); out *= fade[:, None]
pcm = (out * 32767).astype(np.int16)
dest = os.path.join(os.path.dirname(__file__), 'score.wav')
with wave.open(dest, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', dest)
