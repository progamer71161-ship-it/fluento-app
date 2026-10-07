import subprocess

svg_code = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <!-- Background glow & soft drop shadow for blue speech bubble -->
    <filter id="blueBubbleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="8" dy="24" stdDeviation="32" flood-color="#4175FC" flood-opacity="0.38" />
    </filter>

    <!-- Ambient shadow for light bubble -->
    <filter id="lightBubbleGlow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="-10" dy="16" stdDeviation="30" flood-color="#8BB9E6" flood-opacity="0.25" />
    </filter>

    <!-- Soft shadow for owl -->
    <filter id="owlDropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#1E293B" flood-opacity="0.16" />
    </filter>

    <!-- Gradients -->
    <linearGradient id="lightBubbleFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2F8FD" stop-opacity="0.96" />
      <stop offset="60%" stop-color="#E2F1FC" stop-opacity="0.88" />
      <stop offset="100%" stop-color="#CDE7FA" stop-opacity="0.75" />
    </linearGradient>

    <linearGradient id="blueBubbleFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7EA5FF" stop-opacity="0.85" />
      <stop offset="50%" stop-color="#5B87FA" stop-opacity="0.90" />
      <stop offset="100%" stop-color="#4A75F6" stop-opacity="0.94" />
    </linearGradient>

    <linearGradient id="owlCyanBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#02BAF8" />
      <stop offset="60%" stop-color="#00AEEF" />
      <stop offset="100%" stop-color="#009CDC" />
    </linearGradient>

    <linearGradient id="beakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFC518" />
      <stop offset="100%" stop-color="#F7A100" />
    </linearGradient>

    <linearGradient id="micHeadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#E1EBF2" />
      <stop offset="100%" stop-color="#B2C7D6" />
    </linearGradient>
  </defs>

  <!-- ================= 1. SPEECH BUBBLES ================= -->

  <!-- Upper-Left Large Light Ice-Blue Speech Bubble -->
  <g filter="url(#lightBubbleGlow)">
    <path d="M 440,55 
             C 650,55 790,195 790,390 
             C 790,560 670,705 480,730 
             C 425,735 345,730 270,750 
             C 175,775 80,830 35,870 
             C 24,879 12,870 16,854 
             C 38,775 50,695 38,620 
             C 12,550 -2,470 -2,390 
             C -2,195 195,55 440,55 Z" 
          fill="url(#lightBubbleFill)" />
  </g>

  <!-- 3 White Rounded Conversation / Audio Wave Lines in Left Bubble -->
  <g fill="#FFFFFF" opacity="0.96">
    <rect x="200" y="310" width="125" height="26" rx="13" />
    <rect x="200" y="390" width="125" height="26" rx="13" />
    <rect x="200" y="470" width="125" height="26" rx="13" />
  </g>

  <!-- Lower-Right Translucent Periwinkle-Blue Speech Bubble -->
  <g filter="url(#blueBubbleGlow)">
    <path d="M 580,360 
             C 755,360 885,465 915,610 
             C 930,685 915,750 875,805 
             C 910,850 955,892 975,912 
             C 983,920 974,932 962,927 
             C 900,905 838,886 780,892 
             C 722,906 662,915 600,915 
             C 430,915 315,810 315,665 
             C 315,520 425,360 580,360 Z" 
          fill="url(#blueBubbleFill)" />
  </g>

  <!-- ================= 2. THE OWL MASCOT ================= -->
  <g filter="url(#owlDropShadow)">

    <!-- Wings Base / Shell (Slate Grey #7E99A8) with dark charcoal outline -->
    <path d="M 326,410 
             C 305,475 315,548 360,600 
             C 410,652 490,665 550,655 
             C 612,642 665,595 684,532 
             C 695,490 694,440 682,408 
             C 660,530 600,605 500,608 
             C 400,605 348,520 326,410 Z" 
          fill="#7998A8" 
          stroke="#1E2C3A" 
          stroke-width="16" 
          stroke-linejoin="round" />

    <!-- Left Wing Inside Cyan Accent -->
    <path d="M 342,425 
             C 328,490 348,555 392,592 
             C 368,552 358,498 372,442 Z" 
          fill="#00AEEF" 
          stroke="#1E2C3A" 
          stroke-width="14" 
          stroke-linejoin="round" />

    <!-- Main Owl Face & Body (Vibrant Sky Blue #00AEEF) with pointed ear tufts -->
    <path d="M 500,236 
             C 455,225 425,182 385,152 
             C 380,147 372,153 374,160 
             C 385,208 360,262 335,312 
             C 305,372 315,462 355,528 
             C 395,588 450,608 500,608 
             C 550,608 605,588 645,528 
             C 685,462 695,372 665,312 
             C 640,262 615,208 626,160 
             C 628,153 620,147 615,152 
             C 575,182 545,225 500,236 Z" 
          fill="url(#owlCyanBody)" 
          stroke="#1E2C3A" 
          stroke-width="16" 
          stroke-linejoin="round" 
          stroke-linecap="round" />

    <!-- Eyes -->
    <!-- Left Eye -->
    <circle cx="434" cy="328" r="48" fill="#FFFFFF" stroke="#1E2C3A" stroke-width="14" />
    <circle cx="427" cy="328" r="26" fill="#1E2C3A" />
    <circle cx="421" cy="319" r="11" fill="#FFFFFF" />
    <circle cx="436" cy="339" r="4.5" fill="#FFFFFF" />

    <!-- Right Eye -->
    <circle cx="566" cy="328" r="48" fill="#FFFFFF" stroke="#1E2C3A" stroke-width="14" />
    <circle cx="559" cy="328" r="26" fill="#1E2C3A" />
    <circle cx="553" cy="319" r="11" fill="#FFFFFF" />
    <circle cx="568" cy="339" r="4.5" fill="#FFFFFF" />

    <!-- Beak (Golden Yellow Inverted Triangle) -->
    <path d="M 468,370 
             C 490,373 510,373 532,370 
             C 520,404 509,433 500,443 
             C 491,433 480,404 468,370 Z" 
          fill="url(#beakGradient)" 
          stroke="#1E2C3A" 
          stroke-width="12" 
          stroke-linejoin="round" />

    <!-- ================= 3. MICROPHONE & CORD ================= -->

    <!-- Mic Cord (Curves smoothly below owl) -->
    <path d="M 686,608 
             C 710,652 680,698 630,704 
             C 560,708 500,652 478,642 
             C 468,637 458,647 463,657 
             C 478,688 535,738 610,732 
             C 676,726 732,680 710,618 
             C 704,602 692,596 686,608 Z" 
          fill="#1E2C3A" />

    <!-- Angled Microphone (Tilted ~-34 degrees) -->
    <g transform="translate(585, 532) rotate(-34)">
      <!-- Cord plug socket -->
      <path d="M -15,82 L 15,82 L 11,98 L -11,98 Z" fill="#1E2C3A" />

      <!-- Mic Handle (Vibrant Sky Blue with Yellow Doodles) -->
      <path d="M -22,12 L 22,12 L 18,82 L -18,82 Z" 
            fill="#00AEEF" 
            stroke="#1E2C3A" 
            stroke-width="12" 
            stroke-linejoin="round" />

      <!-- Doodle Patterns on Mic Handle -->
      <!-- Mini Musical Note (Eighth note) -->
      <path d="M -8,32 L -8,22 L 6,18 L 6,28 M -8,32 A 4,3 0 1,1 -12,29 M 6,28 A 4,3 0 1,1 2,25" 
            fill="#F7C018" stroke="#F7C018" stroke-width="2.5" stroke-linecap="round" />
      <!-- Star Sparkle -->
      <path d="M 4,44 L 6,40 L 8,44 L 12,46 L 8,48 L 6,52 L 4,48 L 0,46 Z" fill="#F7C018" />
      <!-- Melody Wave -->
      <path d="M -12,48 Q -6,44 0,49 T 10,47" fill="none" stroke="#F7C018" stroke-width="3" stroke-linecap="round" />
      <!-- Note 2 -->
      <circle cx="-4" cy="67" r="4.5" fill="#F7C018" />
      <path d="M 0.5,67 L 0.5,55 L 8,53" fill="none" stroke="#F7C018" stroke-width="2.5" stroke-linecap="round" />

      <!-- Mic Collar Rim -->
      <rect x="-26" y="0" width="52" height="14" rx="4" 
            fill="#B2C7D6" stroke="#1E2C3A" stroke-width="12" stroke-linejoin="round" />

      <!-- Mic Grille Dome -->
      <path d="M -26,0 
               C -26,-44 26,-44 26,0 Z" 
            fill="url(#micHeadGradient)" 
            stroke="#1E2C3A" 
            stroke-width="12" 
            stroke-linejoin="round" />

      <!-- Mesh Grid Texture on Grille -->
      <path d="M -19,-11 L 19,-11 M -22,-22 L 22,-22 M -17,-33 L 17,-33" 
            stroke="#92A9BA" stroke-width="2.5" stroke-linecap="round" />
      <path d="M -11,0 L -11,-37 M 0,0 L 0,-40 M 11,0 L 11,-37" 
            stroke="#92A9BA" stroke-width="2.5" stroke-linecap="round" />
      <!-- White Sheen Highlight -->
      <path d="M -15,-30 C -8,-38 0,-38 5,-35" 
            fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
    </g>
  </g>

  <!-- ================= 4. TYPOGRAPHY ================= -->

  <!-- FLUENTO Title -->
  <text x="500" y="746" 
        text-anchor="middle" 
        font-family="'Fredoka', 'Nunito', 'Arial Rounded MT Bold', 'Inter', -apple-system, sans-serif" 
        font-weight="900" 
        font-size="118" 
        letter-spacing="-1" 
        fill="#222E3C">FLUENTO</text>

  <!-- SKILL THAT MATTERS Tagline -->
  <text x="500" y="798" 
        text-anchor="middle" 
        font-family="'Space Mono', 'Inter', monospace, sans-serif" 
        font-weight="700" 
        font-size="33" 
        letter-spacing="14" 
        fill="#222E3C">SKILL THAT MATTERS</text>
</svg>'''

with open('public/logo.svg', 'w') as f:
    f.write(svg_code)

print("Saved public/logo.svg")
