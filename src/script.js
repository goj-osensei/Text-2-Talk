// ----------------- Config -----------------
      const CONTACT_PHONE = "+918961484431";
      const CONTACT_WHATSAPP = "https://wa.me/918961484431";
      const CONTACT_EMAIL = "prashantmajumder4@gmail.com";
      // ------------------------------------------

      // Typewriter for academy name
      const words = [
        "Text2Talk",
        "Text 2 Talk English Academy",
        "Speak with Prashanta",
      ];
      const el = document.getElementById("typewriter");
      let wIdx = 0,
        cIdx = 0,
        forward = true;
      function typeLoop() {
        const word = words[wIdx];
        if (forward) {
          el.textContent = word.slice(0, cIdx + 1);
          cIdx++;
          if (cIdx === word.length) {
            forward = false;
            setTimeout(typeLoop, 900);
            return;
          }
        } else {
          el.textContent = word.slice(0, cIdx - 1);
          cIdx--;
          if (cIdx === 0) {
            forward = true;
            wIdx = (wIdx + 1) % words.length;
            setTimeout(typeLoop, 400);
            return;
          }
        }
        setTimeout(typeLoop, 60 + Math.random() * 80);
      }
      typeLoop();

      // Buttons
      document.getElementById("callNow").addEventListener("click", () => {
        window.location.href = "tel:" + CONTACT_PHONE;
      });
      document.getElementById("bookDemo").addEventListener("click", () => {
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=Demo%20Class%20Request&body=Hi%2C%20I%20would%20like%20to%20book%20a%20demo%20class.`;
      });
      document.getElementById("openWhats").addEventListener("click", () => {
        window.open(CONTACT_WHATSAPP, "_blank");
      });

      // Contact form -> mailto fallback
      function sendMail(ev) {
        ev.preventDefault();
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        const subject = encodeURIComponent("Website Inquiry from " + name);
        const body = encodeURIComponent(
          "Name: " + name + "\n" + "Email: " + email + "\n" + "Message:" + message + "\n" + "I would like to book a demo class"
        );
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        return false;
      }

      // Intersection Observer for reveal on scroll
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
            }
          });
        },
        { threshold: 0.18 }
      );

      document
        .querySelectorAll(".feature-tile")
        .forEach((el) => io.observe(el));
      document.querySelectorAll(".feature").forEach((el) => io.observe(el));

      // --------- Background particles (cursor-tracking 3D feel) ---------
      const canvas = document.getElementById("bgCanvas");
      const ctx = canvas.getContext("2d");
      let W = (canvas.width = innerWidth),
        H = (canvas.height = innerHeight);
      const DPR = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(DPR, DPR);

      window.addEventListener("resize", () => {
        W = canvas.width = innerWidth;
        H = canvas.height = innerHeight;
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.scale(DPR, DPR);
        initParticles();
      });

      const mouse = { x: W / 2, y: H / 2 };
      window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) {
          mouse.x = e.touches[0].clientX;
          mouse.y = e.touches[0].clientY;
        }
      });

      class Particle {
        constructor() {
          this.reset();
        }
        reset() {
          this.x = Math.random() * W;
          this.y = Math.random() * H;
          this.z = 0.2 + Math.random() * 1.8; // depth factor
          this.r = 0.6 + Math.random() * 2.6; // radius
          this.baseX = this.x;
          this.baseY = this.y;
          this.vx = (Math.random() - 0.5) * 0.2;
          this.vy = (Math.random() - 0.5) * 0.2;
          this.hue = 200 + Math.random() * 40;
          this.alpha = 0.15 + Math.random() * 0.5;
        }
        update() {
          // gentle float
          this.baseX += Math.sin(this.z + Date.now() * 0.0002 + this.r) * 0.02;
          this.baseY += Math.cos(this.z + Date.now() * 0.00019 + this.r) * 0.02;
          // parallax based on mouse offset
          const dx = (mouse.x - W / 2) * (0.0006 * this.z);
          const dy = (mouse.y - H / 2) * (0.0006 * this.z);
          this.x += (this.baseX + dx - this.x) * 0.06;
          this.y += (this.baseY + dy - this.y) * 0.06;
          this.x += this.vx;
          this.y += this.vy;
          // wrap
          if (this.x < -50) this.x = W + 50;
          if (this.x > W + 50) this.x = -50;
          if (this.y < -50) this.y = H + 50;
          if (this.y > H + 50) this.y = -50;
        }
        draw(ctx) {
          const grad = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.r * 8
          );
          grad.addColorStop(0, `rgba(255,255,255,${0.02 * this.z + 0.04})`);
          grad.addColorStop(1, `rgba(10,20,40,0)`);
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      let particles = [];
      function initParticles() {
        particles = [];
        const count = Math.min(120, Math.floor((W * H) / 60000));
        for (let i = 0; i < count; i++) {
          particles.push(new Particle());
        }
      }
      initParticles();

      function animate() {
        ctx.clearRect(0, 0, W, H);
        for (let p of particles) {
          p.update();
          p.draw(ctx);
        }
        requestAnimationFrame(animate);
      }
      animate();

      // small performance tweak: pause canvas when not visible
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancelAnimationFrame(animate);
        else requestAnimationFrame(animate);
      });