// main.js — handles Surprise button, cake reveal and confetti animation
// main.js — handles Welcome modal, Surprise button, cake reveal and confetti animation
(function() {
  const btn = document.getElementById('surpriseBtn');
  const reset = document.getElementById('resetBtn');
  const cake = document.getElementById('cake');
  const balloons = document.getElementById('balloons');
  const canvas = document.getElementById('confetti');
  const subtitle = document.getElementById('subtitle');

  // Modal elements
  const modal = document.getElementById('welcomeModal');
  const openBtn = document.getElementById('openBtn');
  const skipBtn = document.getElementById('skipBtn');
  const nameInput = document.getElementById('nameInput');

  let confettiCtx, particles = [], raf;
  let isMuted = false;

  function resizeCanvas(){
    if(!canvas) return;
    canvas.width = canvas.clientWidth || canvas.offsetWidth;
    canvas.height = canvas.clientHeight || canvas.offsetHeight;
  }

  function makeParticles(count=120){
    const colors = ['#ff6b6b','#ffd166','#6bd1ff','#6bffb8','#c998ff','#ff9aa2'];
    particles = [];
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*canvas.width,
        y: Math.random()*-canvas.height,
        r: Math.random()*8+4,
        dx: (Math.random()-0.5)*3,
        dy: Math.random()*4+2,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360
      })
    }
  }

  function draw(){
    confettiCtx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      confettiCtx.save();
      confettiCtx.translate(p.x,p.y);
      confettiCtx.rotate(p.rot*Math.PI/180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6);
      confettiCtx.restore();

      p.x += p.dx; p.y += p.dy; p.rot += 6;
      if(p.y>canvas.height+50){ p.y = -20; p.x = Math.random()*canvas.width }
    })
    raf = requestAnimationFrame(draw);
  }

  function startConfetti(){
    if(!canvas) return;
    confettiCtx = canvas.getContext('2d');
    resizeCanvas();
    makeParticles(140);
    cancelAnimationFrame(raf);
    draw();
    // stop after a while
    setTimeout(()=>{ stopConfetti(); }, 4500);
  }

  function stopConfetti(){
    cancelAnimationFrame(raf);
    if(confettiCtx) confettiCtx.clearRect(0,0,canvas.width,canvas.height);
  }

  function reveal(){
    cake.classList.remove('hidden');
    cake.setAttribute('aria-hidden','false');
    balloons.classList.remove('hidden');
    balloons.setAttribute('aria-hidden','false');
    reset.setAttribute('aria-hidden','false');
    // add candle flicker effect
    cake.classList.add('flicker');
    startConfetti();
  }

  function resetAll(){
    cake.classList.add('hidden');
    cake.setAttribute('aria-hidden','true');
    balloons.classList.add('hidden');
    balloons.setAttribute('aria-hidden','true');
    reset.setAttribute('aria-hidden','true');
    // remove flicker
    cake.classList.remove('flicker');
    stopConfetti();
  }

  // --- Animated floating message generator ---
  function generateAnimatedMessage(text){
    const container = document.createElement('div');
    container.className = 'floating-message';
    container.textContent = text;
    // random pastel gradient background
    const colors = [
      ['#ff9a9e','#fecfef'],['#a18cd1','#fbc2eb'],['#f6d365','#fda085'],['#84fab0','#8fd3f4'],['#ffd166','#ff6b6b']
    ];
    const c = colors[Math.floor(Math.random()*colors.length)];
    container.style.background = `linear-gradient(135deg, ${c[0]}, ${c[1]})`;
    container.style.color = '#fff';
    container.style.left = (10 + Math.random()*80) + '%';
    document.body.appendChild(container);
    // remove when animation finishes
    container.addEventListener('animationend', ()=>{ container.remove(); });
  }

  function triggerMessages(name, times=6, interval=220){
    const base = name ? `Happy Birthday, ${name}!` : 'Happy Birthday!';
    for(let i=0;i<times;i++){
      setTimeout(()=>{ generateAnimatedMessage(base); }, i*interval);
    }
  }

  // --- WebAudio Happy Birthday melody (simple synth) ---
  function playMelody(){
    if(isMuted) return; // don't play when muted
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, now);
      osc.start(now);

      // notes (Hz) approximate for Happy Birthday melody
      const notes = [
        261.63,261.63,293.66,261.63,349.23,329.63, // Happy birthday to you
        261.63,261.63,293.66,261.63,392.00,349.23, // Happy birthday to you
        261.63,261.63,523.25,440.00,349.23,329.63,293.66, // Happy birthday dear NAME
        466.16,466.16,440.00,349.23,392.00,349.23 // Happy birthday to you
      ];
      let t = 0;
      const dur = 0.34;
      notes.forEach((n, i)=>{
        // ramp gain for each note
        gain.gain.cancelScheduledValues(now + t);
        gain.gain.setValueAtTime(0, now + t);
        gain.gain.linearRampToValueAtTime(0.12, now + t + 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + t + dur - 0.02);
        osc.frequency.setValueAtTime(n, now + t);
        t += dur;
      });
      // stop oscillator after melody
      osc.stop(now + t + 0.05);
    }catch(e){
      console.warn('Audio not available:', e);
    }
  }

  // Modal control: show on load
  function showModal(){
    if(!modal) return;
    modal.classList.remove('hidden');
    nameInput.value = '';
    nameInput.focus();
  }

  function hideModal(){
    if(!modal) return;
    modal.classList.add('hidden');
  }

  openBtn.addEventListener('click', ()=>{
    const name = (nameInput.value || '').trim();
    if(name) subtitle.textContent = `Happy Birthday, ${name}!`;
    else subtitle.textContent = 'Happy Birthday!';
    hideModal();
    // audio + messages + reveal
    // open letter first for a nicer experience
    openLetter(name);
  });

  skipBtn.addEventListener('click', ()=>{
    hideModal();
  });

  nameInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      openBtn.click();
    }
  });

  window.addEventListener('resize', ()=>{ resizeCanvas(); });
  // Surprise button should open the letter first (then use Open Cake inside letter)
  btn.addEventListener('click', ()=>{ openLetter(''); });

  // --- Mute toggle ---
  const muteBtn = document.getElementById('muteBtn');
  if(muteBtn){
    // restore saved preference
    const saved = localStorage.getItem('hb-muted');
    if(saved === '1'){ isMuted = true; muteBtn.textContent = '🔈'; muteBtn.setAttribute('aria-pressed','true') }
    muteBtn.addEventListener('click', ()=>{
      isMuted = !isMuted;
      muteBtn.textContent = isMuted ? '🔈' : '🔊';
      muteBtn.setAttribute('aria-pressed', String(isMuted));
      localStorage.setItem('hb-muted', isMuted ? '1' : '0');
    });
  }

  // remove print/download features per request; wire reset
  reset.addEventListener('click', ()=>{ resetAll(); });

  // initial setup when DOM is ready
  document.addEventListener('DOMContentLoaded', ()=>{
    if(canvas){
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      resizeCanvas();
    }
    // show modal on first load
    showModal();
  });
  
  // --- Letter handlers ---
  const letterWrap = document.getElementById('letterWrap');
  const envelopeEl = document.getElementById('envelope');
  const openCakeBtn = document.getElementById('openCakeBtn');
  const closeLetterBtn = document.getElementById('closeLetterBtn');
  const editLetterBtn = document.getElementById('editLetterBtn');
  const saveLetterBtn = document.getElementById('saveLetterBtn');
  const letterText = document.getElementById('letterText');

  function openLetter(name){
    if(!letterWrap || !envelopeEl) return;
    // personalize the letter if name provided
    const sign = envelopeEl.querySelector('.wish-sign');
    if(name && sign) sign.textContent = `Happy Birthday, ${name}!`;
    else if(sign) sign.textContent = 'Happy Birthday!';

    letterWrap.classList.remove('hidden');
    letterWrap.setAttribute('aria-hidden','false');
    // ensure envelope starts closed
    envelopeEl.classList.remove('open');
    envelopeEl.classList.add('closed');
    // small delay then open flap and slide letter up
    setTimeout(()=>{
      envelopeEl.classList.remove('closed');
      envelopeEl.classList.add('open');
    }, 220);
  }

  function closeLetter(){
    if(!letterWrap || !envelopeEl) return;
    envelopeEl.classList.remove('open');
    envelopeEl.classList.add('closed');
    setTimeout(()=>{
      letterWrap.classList.add('hidden');
      letterWrap.setAttribute('aria-hidden','true');
    }, 600);
  }

  // Edit/save handlers for the letter content
  if(editLetterBtn && saveLetterBtn && letterText){
    editLetterBtn.addEventListener('click', ()=>{
      // show textarea populated with current text
      const lines = envelopeEl.querySelectorAll('.wish-line');
      const sign = envelopeEl.querySelector('.wish-sign');
      const content = [lines[0]?.textContent||'', lines[1]?.textContent||'', sign?.textContent||'Happy Birthday!'].join('\n');
      letterText.value = content;
      letterText.classList.remove('hidden');
      saveLetterBtn.classList.remove('hidden');
      editLetterBtn.classList.add('hidden');
    });

    saveLetterBtn.addEventListener('click', ()=>{
      const val = letterText.value || '';
      const parts = val.split(/\r?\n/);
      const l1 = parts[0]||''; const l2 = parts[1]||''; const signTxt = parts.slice(2).join(' ') || 'Happy Birthday!';
      const p1 = envelopeEl.querySelector('.wish-line');
      const p2 = envelopeEl.querySelectorAll('.wish-line')[1];
      const sign = envelopeEl.querySelector('.wish-sign');
      if(p1) p1.textContent = l1;
      if(p2) p2.textContent = l2;
      if(sign) sign.textContent = signTxt;
      // hide editor
      letterText.classList.add('hidden');
      saveLetterBtn.classList.add('hidden');
      editLetterBtn.classList.remove('hidden');
    });
  }

  openCakeBtn.addEventListener('click', ()=>{
    // play melody, messages, then reveal cake
    playMelody();
    // use name if present in sign
    const nameText = envelopeEl.querySelector('.wish-sign')?.textContent || '';
    const nameMatch = nameText.match(/Happy Birthday,\s*(.*)!/);
    const name = nameMatch ? nameMatch[1] : '';
    triggerMessages(name, 8, 150);
    // close letter a bit then reveal cake
    setTimeout(()=>{
      closeLetter();
      reveal();
    }, 900);
  });

  closeLetterBtn.addEventListener('click', ()=>{ closeLetter(); });
})();
