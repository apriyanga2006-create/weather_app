(function(){
  const form = document.getElementById('surveyForm');
  const msg = document.getElementById('surveyMsg');

  function saveSubmission(data){
    const key = 'survey_submissions';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(Object.assign({ts: Date.now()}, data));
    localStorage.setItem(key, JSON.stringify(existing));
  }

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      rating: form.rating.value,
      comments: form.comments.value.trim()
    };
    if(!data.rating){
      msg.textContent = 'Please select a rating.';
      msg.style.color = '#ffb4b4';
      return;
    }
    saveSubmission(data);
    msg.textContent = 'Thanks — your response is recorded.';
    msg.style.color = '#bfffe0';
    msg.classList.remove('message-flash');
    void msg.offsetWidth;
    msg.classList.add('message-flash');
    form.reset();
  });

})();
