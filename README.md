# Guardian Orbit
### Autonomous Debris Mitigation System

**Developed by Saketh Ragirolla**

Guardian Orbit is a high-fidelity, interactive 3D web application simulating a "Guardian" satellite swarm protecting the International Space Station (ISS) from orbital debris. Built for the modern web using React, Three.js (React Three Fiber), and TypeScript, it combines accurate orbital mechanics with gamified command-and-control features.
<img width="1598" height="893" alt="image" src="https://github.com/user-attachments/assets/dfb20073-7ad8-4077-a408-5af81037bc51" />




---

## 🚀 Features

*   **Real-time 3D Rendering:** A fully immersive space environment featuring a rotating Earth, dynamic lighting, and a holographic orbital grid.
*   **Swarm Intelligence:** Autonomous satellites that detect threats, assign intercepts based on proximity, and manage their own battery levels.
*   **Interactive Command Center:**
    *   **Telemetry:** Click any object to view real-time altitude, velocity, and status.
    *   **Camera Lock:** Smoothly track any satellite or debris piece using a cinematic camera rig.
    *   **Manual Override:** Engage "Boost Mode" to overcharge lasers (at the cost of battery life) for faster neutralization.
*   **Dynamic HUD:** Sci-fi interface with live terminal logs, threat counters, and battery monitoring.

---

## 📐 The Mathematics & Physics Engine

This simulation relies on a simplified implementation of **Keplerian Orbital Mechanics** and **Euclidean Vector Physics** to render realistic movement and calculate intercepts in real-time.

### 1. Orbital State Vectors (Keplerian Elements)
Every object in the simulation (Satellites, Debris, ISS) is defined not by static coordinates, but by **Orbital Elements**. This allows the simulation to predict position at any given time $t$.

We define an orbit using:
*   **$a$ (Semi-major Axis):** The sum of Earth's Radius ($R_{\oplus} \approx 6378 \text{ km}$) and the object's altitude ($h$).
    $$r = R_{\oplus} + h$$
*   **$i$ (Inclination):** The tilt of the orbital plane relative to the equatorial plane (e.g., ISS is $\approx 51.6^{\circ}$).
*   **$\Omega$ (RAAN):** Right Ascension of the Ascending Node. This defines the rotation of the orbital plane around the Earth's polar axis.
*   **$\nu$ (True Anomaly):** The object's current position along its orbital path (an angle in radians).

### 2. Coordinate Transformation (Orbital to Cartesian)
To render these abstract angles on a 3D screen, we convert them into Cartesian coordinates $(x, y, z)$ every frame (60Hz).

First, we calculate the position in a 2D plane (the orbital plane):
$$x_{orb} = r \cdot \cos(\nu(t))$$
$$y_{orb} = r \cdot \sin(\nu(t))$$

Next, we apply **Intrinsic Euler Rotations** to rotate this 2D plane into 3D space based on the Inclination ($i$) and RAAN ($\Omega$).

The transformation matrix logic used in the engine is:

$$x = x_{orb} \cos(\Omega) - y_{orb} \cos(i) \sin(\Omega)$$
$$z = x_{orb} \sin(\Omega) + y_{orb} \cos(i) \cos(\Omega)$$
$$y = y_{orb} \sin(i)$$

*(Note: In 3D graphics, the Y-axis is typically "Up", while in Physics, Z is often "Up". The code maps the physics-Z to the visual-Y axis).*

### 3. Time Integration
The simulation uses discrete time-stepping. The position along the orbit ($\nu$) is updated based on angular velocity ($\omega$):

$$\nu_{new} = \nu_{old} + (\omega \cdot \Delta t)$$

Where $\Delta t$ is the time delta between frames multiplied by the simulation speed slider.

### 4. Threat Detection (Euclidean Distance)
Collision detection is performed using 3D Euclidean distance checks. For every frame, we calculate the vector magnitude between the Asset vector ($\vec{A}$) and every Debris vector ($\vec{D}$):

$$d = \sqrt{(x_D - x_A)^2 + (y_D - y_A)^2 + (z_D - z_A)^2}$$

If $d < 1500 \text{ km}$ (The Threat Threshold), the debris is flagged as a **THREAT**, triggering the Guardian Protocol.

---

## 🧠 Autonomous Logic (The Guardian Protocol)

The swarm operates on a decentralized state machine:

1.  **Scan:** Continuous $O(n)$ distance checks against the Asset.
2.  **Assignment:** When a threat is detected, the system performs a spatial query to find the nearest **IDLE** Guardian satellite.
3.  **Intercept:** The satellite state switches to `TRACKING`. It rotates to face the target and begins the neutralization sequence.
4.  **Energy Constraints:**
    *   Firing lasers depletes `Energy` at a rate of $E_{drain} = 15\% / s$.
    *   If $E < 0$, the satellite enters `RECHARGING` mode and cannot fire until $E = 100$.
    *   Idle satellites passively recharge via solar panels.

---

## 🛠️ Tech Stack

*   **Core Framework:** React 19
*   **Language:** TypeScript
*   **3D Engine:** React Three Fiber (Three.js wrapper)
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Math Utilities:** Custom physics hooks

---

## 📦 How to Run

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
4.  Open your browser to the local host address provided.

---

## 🎮 Controls

*   **Left Click + Drag:** Rotate Camera
*   **Right Click + Drag:** Pan Camera
*   **Scroll:** Zoom In/Out
*   **Click Object:** Select object and view Telemetry
*   **HUD Controls:**
    *   **Play/Pause:** Stop or start time.
    *   **Speed Slider:** Fast forward the simulation.
    *   **Lock Camera:** Follow the selected object.
    *   **Boost Button:** (Only available when a satellite is tracking) Overcharge the laser.

---

*© 2023 Saketh Ragirolla*
