# Spline Model Links

This document organises Spline 3D scene URLs by product for real-time
preview in the SuDS Enviro Configurator and the marketing site.

For each scene, paste the public Spline URL (or the `.splinecode` URL)
and any exposed variables / events the scene listens for.

---

## Brand Assets

The product pages use the SuDS Enviro slogan logo. Two variants are needed
because some pages use a dark hero (white logo) and others use a light or
white background (main coloured logo).

| Context | File path (in `public/`) | Use on |
|---|---|---|
| **Dark / navy backgrounds** | `'SuDS Enviro'/SuDS Logo - Slogan - White.png` | Wizard header, hero overlays on the navy banner, footer on dark sections |
| **White / light backgrounds** | `'SuDS Enviro'/SuDS Logo - Slogan - Main.png` | Marketing landing page, product pages, brochures, light cards |

Web URLs (the folder contains literal single quotes - browsers auto-encode):

- White: `/'SuDS Enviro'/SuDS Logo - Slogan - White.png`
- Main:  `/'SuDS Enviro'/SuDS Logo - Slogan - Main.png`

In React / Next.js components:

```tsx
import Image from 'next/image'

// On a navy or dark background
<Image
  src="/%27SuDS%20Enviro%27/SuDS%20Logo%20-%20Slogan%20-%20White.png"
  alt="SuDS Enviro"
  width={200}
  height={120}
  priority
/>

// On a white or light background
<Image
  src="/%27SuDS%20Enviro%27/SuDS%20Logo%20-%20Slogan%20-%20Main.png"
  alt="SuDS Enviro"
  width={200}
  height={120}
  priority
/>
```

> No-slogan variants exist in the same folder
> (`SuDS Logo - No Slogan - Main.webp` and `SuDS Logo - No Slogan - White.webp`)
> for compact placements (favicons, app bars, footers).

---

# SIMPLE VERSION (per product, one scene each)

## Inspection Chamber - RHINO SERSIC / SERFIC
Diameters 450/600/750/900/1050/1200. Outlet fixed at 12 o'clock. Inlets at 3/5/6/7/9 only (max 5).
- **SERSIC - Breakout - Scroll**: 
- **SERSIC - Breakout - Animation**: 
- **SERSIC - Breakout - Scroll - Mobile**: 
- **SERFIC - Breakout - Scroll**: 
- **SERFIC - Breakout - Scroll - Mobile**: 

## Catchpit - SERS Series (300/450/600 with silt bucket)
- **SERPT (Std. Catch Pit) - Breakout**: 

## Catchpit - SERDS Series (450-1200 with built-in settling)
- **SERSD - Breakout - Scroll**: 

## Flow Control - SERF (Orifice, 300/450/600)
- **Orifice Flow Control - Breakout - Scroll**: 

## Flow Control - ROTEX (Vortex, 600-1200)
- **Vortex Flow Control - Breakout - Scroll**: 

## RHINO SEHDS Hydrodynamic Separator (GRP, 750/1200/1800/2500, 360-deg inlet)
- **Hydrodynamic Separator - Breakout**: 

## RHINOLIFT Pumping Station (MDPE/GRP, 600-1200 wet wells)
- **Pumping Stations - Breakout - Scroll**: 
- **Pumping Stations - Breakout - Animation**: 
- **Pump Tank - Breakout**: 

## RhinoPod (polishing filter, standalone or SEHDS add-on)
- **RhinoPod - Breakout**: 
- **RhinoPod - Breakout - Copy**: 

## Grease Trap / Additional Products
- **JUMBO Micro Grease Trap - Breakout**: 
- **MINI - Breakout**: 
- **MAXI - Breakout**: 
- **AQUA - Breakout**: 
- **Rhino Duct - Breakout**:  

---

# DETAILED VERSION (component breakdown)

## Inspection Chamber - RHINO SERSIC / SERFIC

> Outlet fixed at **12 o'clock** (north). Inlets manufactured at **3, 5, 6, 7, 9 o'clock** only - hard ceiling of 5 inlets.

### Chamber Body
- **450mm diameter**: 
- **600mm diameter**: 
- **750mm diameter**: 
- **900mm diameter**: 
- **1050mm diameter**: 
- **1200mm diameter**: 

### Cover Plate
- **Standard**: 

### Outlet Pipe (Fixed at 12 o'clock)
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 
- **300mm Twinwall**: 
- **450mm Twinwall**: 

### Inlet Pipes (one of clock positions 3, 5, 6, 7, 9)
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 
- **300mm Twinwall**: 
- **450mm Twinwall**: 

### Sump (Base Sediment Zone)
- **Standard**: 

### Variables / Events to expose
- `scroll-progress` (0-1) - drives the breakout / explode animation
- `diameter` (450 / 600 / 750 / 900 / 1050 / 1200)
- `depth` (1000-6000 mm in 500 increments)
- `inlet-1-pos` ... `inlet-5-pos` (3 / 5 / 6 / 7 / 9 / hidden)
- `inlet-1-size` ... `inlet-5-size` (110 / 160 / 225 / 300 / 450)
- `outlet-size` (110 / 160 / 225 / 300 / 450)
- Event: `explode` / `reset-pose`

---

## Catchpit / Silt Trap

Two manufactured series with different scopes - one Spline scene per series.

### SERS Series (with removable silt bucket, 300/450/600)

#### Chamber Body
- **300mm diameter**: 
- **450mm diameter**: 
- **600mm diameter**: 

#### Silt Bucket (removable)
- **Standard**: 

#### Cover Plate
- **Standard**: 

#### Outlet Pipe (Fixed at 12 o'clock)
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 

#### Inlet Pipes
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 

#### Variables / Events
- `scroll-progress` (0-1)
- `diameter` (300 / 450 / 600)
- `bucket-visible` (true / false)
- Event: `lift-bucket` / `lower-bucket`

### SERDS Series (built-in settling, 450/600/750/900/1050/1200)

#### Chamber Body
- **450mm diameter**: 
- **600mm diameter**: 
- **750mm diameter**: 
- **900mm diameter**: 
- **1050mm diameter**: 
- **1200mm diameter**: 

#### Internal Settling Baffles
- **Standard**: 

#### Cover Plate
- **Standard**: 

#### Outlet Pipe (Fixed at 12 o'clock)
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 
- **300mm Twinwall**: 
- **450mm Twinwall**: 

#### Inlet Pipes
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 
- **300mm Twinwall**: 
- **450mm Twinwall**: 

#### Variables / Events
- `scroll-progress` (0-1)
- `diameter` (450 / 600 / 750 / 900 / 1050 / 1200)
- Event: `cutaway` - reveal the internal settling baffles

---

## Flow Control - SERF (Orifice) and ROTEX (Vortex)

Two separate products with their own diameter ranges.

### SERF Series (Orifice plate, 300/450/600)

#### Chamber Body
- **300mm diameter**: 
- **450mm diameter**: 
- **600mm diameter**: 

#### Orifice Plate
- **Variable orifice (parametric)**: 

#### Inlet / Outlet Stubs
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 

#### Variables / Events
- `scroll-progress` (0-1)
- `diameter` (300 / 450 / 600)
- `orifice-size-mm` - swap or scale the orifice
- `head-level` (0-1) - water-level animation showing the design head
- Event: `reveal-orifice`

### ROTEX Series (Vortex regulator, 600/750/900/1050/1200)

#### Chamber Body
- **600mm diameter**: 
- **750mm diameter**: 
- **900mm diameter**: 
- **1050mm diameter**: 
- **1200mm diameter**: 

#### Vortex Unit
- **Standard**: 

#### Inlet / Outlet Stubs
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 

#### Variables / Events
- `scroll-progress` (0-1)
- `diameter` (600 / 750 / 900 / 1050 / 1200)
- `vortex-spin` (0-1) - drive the vortex animation speed
- `flow-rate-ls` - particle density
- Event: `cutaway`

---

## RHINO SEHDS Hydrodynamic Separator

One-piece GRP separator. Diameters 750 / 1200 / 1800 / 2500 mm.
**360-degree inlet positioning**. Optional RHINO POD polishing filter.
Mitigation indices fixed at **5-4-5** (SS / Hydrocarbons / Debris).

### GRP Body
- **750mm diameter**: 
- **1200mm diameter**: 
- **1800mm diameter**: 
- **2500mm diameter**: 

### Internal Vortex Baffles
- **Standard**: 

### Inlet Stub (parametric angle 0-359 degrees)
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 
- **300mm Twinwall**: 

### Outlet Stub
- **110mm EN1401**: 
- **160mm EN1401**: 
- **225mm Twinwall**: 
- **300mm Twinwall**: 

### RHINO POD Add-on (polishing filter)
- **Standalone POD**: 
- **POD attached to SEHDS**: 

### Variables / Events
- `scroll-progress` (0-1)
- `diameter` (750 / 1200 / 1800 / 2500)
- `inlet-angle-deg` (0-359) - rotate the inlet stub around the body
- `pod-attached` (true / false)
- `flow-particles` (low / medium / high)
- `mitigation-callouts` (true / false) - reveal the 5-4-5 indices
- Event: `cutaway-vortex`
- Event: `attach-pod` / `detach-pod`

---

## RHINOLIFT Pumping Station

MDPE / GRP packaged station. Wet-well diameters 600 / 750 / 900 / 1050 / 1200 mm.
Single pump or duty / standby. Vortex (50mm solids) or macerator pumps.

### Wet Well
- **600mm diameter**: 
- **750mm diameter**: 
- **900mm diameter**: 
- **1050mm diameter**: 
- **1200mm diameter**: 

### Pumps
- **Vortex (50mm solids)**: 
- **Macerator**: 

### Control Panel
- **Standard**: 
- **With telemetry / Bluetooth**: 

### Cover / Access
- **Standard**: 

### Outlet Pipe (rising main)
- **110mm**: 
- **160mm**: 
- **225mm**: 

### Variables / Events
- `scroll-progress` (0-1)
- `wet-well-diameter` (600 / 750 / 900 / 1050 / 1200)
- `pump-count` (1 or 2)
- `pump-type` (vortex / macerator)
- `controller-visible` (true / false)
- Event: `cutaway-wet-well`
- Event: `pump-cycle`

---

## Other Products (placeholders - confirm if Spline scenes exist)

### Grease Trap (micro / mini / midi / jumbo)
- **JUMBO Micro Grease Trap - Breakout**: 
- **MINI - Breakout**: 
- **MAXI - Breakout**: 

### Grease Separator
- **Hero scene**: 

### AQUA Rainwater / Harvesting Tank
- **AQUA - Breakout**: 

### RhinoPod (polishing filter, standalone)
- **RhinoPod - Breakout**: 
- **RhinoPod - Breakout - Copy**: 
- Note: also referenced as the SEHDS add-on above

### Rhino Duct
- **Rhino Duct - Breakout**: 

### Rhino Bases & Adapters
- **Rhino Bases & Adapters - Breakout**: 

### Septic Tank
- Hero scene: 

### Drawpit (load ratings A15 / B125 / C250 / D400 / E600 / F900)
- Hero scene: 

---

## Shared Components

### Connector Flanges
- **110mm**: 
- **160mm**: 
- **225mm**: 
- **300mm**: 
- **450mm**: 

### Rubber Seals
- **110mm**: 
- **160mm**: 
- **225mm**: 
- **300mm**: 
- **450mm**: 

### Inspection Rungs
- **Standard**: 

---

## Adapters & Reducers

### Twinwall Adapters
- **225-150 Twinwall Adaptor**: 
- **150-110 Twinwall Adaptor**: 

### Ridgidrain Adapters
- **225 Ridgidrain Adaptor**: 

### Ultrarib Adapters
- **225 Ultrarib Adaptor**:  

---

## How to fill this file in

For each scene, paste:

1. The Spline scene URL (`https://prod.spline.design/...` or the `.splinecode` URL the runtime fetches).
2. Any **variables** the scene exposes for runtime control (`spline.setVariable(name, value)`).
3. Any **events** the scene listens for (`spline.emitEvent(name)`).
4. Any **named objects** to manipulate directly (`spline.findObjectByName(name)`).

Once a scene is filled in, the integration code can be written to bind
scroll position, wizard state, and button presses to the scene's controls.
