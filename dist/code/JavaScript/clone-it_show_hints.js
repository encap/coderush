function showHints() {
  puzzles.innerHTML = '';

  shuffleArray(this.json.cssHints);

  this.json.cssHints.forEach(hint => {
    const el = document.createElement('span');
    el.innerText = hint;
    el.setAttribute('draggable', true);
    el.setAttribute('ondragstart', 'handleDragStart(event)');
    puzzles.appendChild(el);
    document.querySelector('.css').style.display = 'flex';
    puzzles.style.display = 'block';
  });
}