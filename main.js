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
  let codePassed = false;

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
    if(btn) btn.classList.add('hidden');
    // remove flicker
    cake.classList.remove('flicker');
    stopConfetti();
    // hide stickmen if present
    hideStickmen();
  }

  // --- Disco party mode ---
  let discoCtx = null, discoOsc = null, discoGain = null, discoInterval = null;
  let discoActive = false;
  let textLoopInterval = null;
  const discoPhrases = ["yey!","HAHAHA!","let's dance!","come on!"];
  function enterDisco(){
    if(discoActive) return;
    document.body.classList.add('disco');
    discoActive = true;
    createDiscoOverlay();
    showStickmen();
    startTextLoop();
    if(isMuted) return; // visual-only if muted
    try{
      discoCtx = new (window.AudioContext || window.webkitAudioContext)();
      discoOsc = discoCtx.createOscillator();
      discoGain = discoCtx.createGain();
      discoOsc.type = 'sawtooth';
      discoOsc.frequency.setValueAtTime(110, discoCtx.currentTime);
      discoOsc.connect(discoGain);
      discoGain.connect(discoCtx.destination);
      discoGain.gain.setValueAtTime(0.001, discoCtx.currentTime);
      discoOsc.start();
      discoInterval = setInterval(()=>{
        const now = discoCtx.currentTime;
        discoGain.gain.cancelScheduledValues(now);
        discoGain.gain.setValueAtTime(0.001, now);
        discoGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
        discoGain.gain.linearRampToValueAtTime(0.001, now + 0.22);
      }, 420);
    }catch(e){ console.warn('Disco audio not available', e); }
  }
  function exitDisco(){
    if(!discoActive) return;
    document.body.classList.remove('disco');
    discoActive = false;
    removeDiscoOverlay();
    hideStickmen();
    stopTextLoop();
    if(discoInterval) clearInterval(discoInterval);
    if(discoOsc){ try{ discoOsc.stop(); }catch(e){} discoOsc = null }
    if(discoCtx){ try{ discoCtx.close(); }catch(e){} discoCtx = null }
    discoGain = null; discoInterval = null;
  }
  function startTextLoop(){
    stopTextLoop();
    let idx = 0;
    textLoopInterval = setInterval(()=>{
      const txt = discoPhrases[idx % discoPhrases.length];
      generateAnimatedMessage(txt);
      idx++;
    }, 700);
  }
  function stopTextLoop(){ if(textLoopInterval){ clearInterval(textLoopInterval); textLoopInterval = null } }
  // show/hide stickmen
  const stickmenEl = document.getElementById('stickmen');
  function showStickmen(){ if(stickmenEl){ stickmenEl.classList.remove('hidden'); stickmenEl.setAttribute('aria-hidden','false'); } }
  function hideStickmen(){ if(stickmenEl){ stickmenEl.classList.add('hidden'); stickmenEl.setAttribute('aria-hidden','true'); } }
  // create/remove visual overlay for disco
  function createDiscoOverlay(){
    const ov = document.createElement('div'); ov.className = 'disco-overlay';
    const s1 = document.createElement('div'); s1.className='spot c1';
    const s2 = document.createElement('div'); s2.className='spot c2';
    const s3 = document.createElement('div'); s3.className='spot c3';
    ov.appendChild(s1); ov.appendChild(s2); ov.appendChild(s3);
    document.body.appendChild(ov);
    return ov;
  }
  function removeDiscoOverlay(){ const ex = document.querySelector('.disco-overlay'); if(ex) ex.remove(); }

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

  if(openBtn) openBtn.addEventListener('click', ()=>{
    const name = (nameInput.value || '').trim();
    if(name) subtitle.textContent = `Happy Birthday, ${name}!`;
    else subtitle.textContent = 'Happy Birthday!';
    hideModal();
    // audio + messages + reveal
    // open letter first for a nicer experience
    openLetter(name);
  });
  if(skipBtn) skipBtn.addEventListener('click', ()=>{
    hideModal();
  });
  if(nameInput) nameInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      openBtn.click();
    }
  });

  window.addEventListener('resize', ()=>{ resizeCanvas(); });
  // Surprise button should open the letter first (then use Open Cake inside letter)
  if(btn) btn.addEventListener('click', ()=>{
    // if disco already active -> stop it
    if(document.body.classList.contains('disco')){ exitDisco(); return; }
    // if code was passed and cake is revealed (has flicker), use this button to start disco
    if(codePassed && cake && cake.classList.contains('flicker')){ enterDisco(); return; }
    // otherwise, open the letter as before
    openLetter('');
  });

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
  if(reset) reset.addEventListener('click', ()=>{ resetAll(); exitDisco(); });

  // initial setup when DOM is ready
  document.addEventListener('DOMContentLoaded', ()=>{
    if(canvas){
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      resizeCanvas();
    }
    // show code gate first; only after correct code will we show the modal
    const codeGate = document.getElementById('codeGate');
    const codeDisplay = document.getElementById('codeDisplay');
    const keys = codeGate ? codeGate.querySelectorAll('.key') : [];
    let codeVal = '';
  const secret = '11142006';
    function updateDisplay(){ codeDisplay.textContent = codeVal || '\u00A0'; }
    function clearCode(){ codeVal = ''; updateDisplay(); }
    function backspace(){ codeVal = codeVal.slice(0,-1); updateDisplay(); }
    function submitCode(){
      if(codeVal === secret){
        // correct — hide gate and show the welcome modal so the user can type the name
        codeGate.classList.add('hidden');
        // show the existing name modal so they can enter the recipient's name
        setTimeout(()=>{ showModal(); }, 220);
      } else {
        // brief shake/clear to indicate wrong
        codeDisplay.classList.add('wrong');
        setTimeout(()=>{ codeDisplay.classList.remove('wrong'); clearCode(); }, 600);
      }
    }
      // hide the primary UI buttons when code is entered
      function onCodeSuccess(){
        codePassed = true;
        if(btn) btn.classList.add('hidden');
        if(reset) reset.classList.add('hidden');
      }
    if(codeGate){
      updateDisplay();
      keys.forEach(k=>{
        k.addEventListener('click', ()=>{
          const cls = k.className || '';
          const v = k.textContent.trim();
          if(cls.indexOf('key-clear')>=0){ clearCode(); return; }
          if(cls.indexOf('key-back')>=0){ backspace(); return; }
          if(cls.indexOf('key-enter')>=0){ submitCode(); return; }
          // numeric key
          if(codeVal.length < 12 && /\d/.test(v)){
            codeVal += v;
            updateDisplay();
          }
        })
      })
      // allow keyboard input while gate is present
      window.addEventListener('keydown', (e)=>{
        if(codeGate.classList.contains('hidden')) return;
        if(e.key === 'Enter'){ submitCode(); }
        else if(e.key === 'Backspace'){ backspace(); }
        else if(e.key === 'Escape'){ clearCode(); }
        else if(/^[0-9]$/.test(e.key)){ if(codeVal.length<12){ codeVal += e.key; updateDisplay(); } }
      });
      // when the code is submitted successfully, hide primary buttons
      const origSubmit = submitCode;
      submitCode = function(){
        if(codeVal === secret){
          onCodeSuccess();
        }
        origSubmit();
      }
    }
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

  if(openCakeBtn) openCakeBtn.addEventListener('click', ()=>{
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
      // after reveal, show Surprise and Reset controls so user can start disco
      setTimeout(()=>{
        if(btn) btn.classList.remove('hidden');
        if(reset) reset.classList.remove('hidden');
      }, 600);
    }, 900);
  });

  if(closeLetterBtn) closeLetterBtn.addEventListener('click', ()=>{ closeLetter(); });
})();
