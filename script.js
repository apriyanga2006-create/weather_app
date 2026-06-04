(() => {
    const apiKey = "70d87b94b42575cfbfa44ba1081b8c20";
    const refs = {
        city: document.getElementById('city'),
        searchBtn: document.getElementById('searchBtn'),
        lastBtn: document.getElementById('lastBtn'),
        unitC: document.getElementById('unitC'),
        unitF: document.getElementById('unitF'),
        loading: document.getElementById('loading'),
        weatherCard: document.getElementById('weatherCard'),
        weatherIcon: document.getElementById('weatherIcon'),
        loc: document.getElementById('loc'),
        temp: document.getElementById('temp'),
        desc: document.getElementById('desc'),
        details: document.getElementById('details'),
        forecast: document.getElementById('forecast'),
        cardExtra: document.getElementById('cardExtra'),
        weatherCard: document.getElementById('weatherCard')
    };

    let units = localStorage.getItem('units') || 'metric';
    setUnitButtons();

    function showLoading(show){
        refs.loading.classList.toggle('hidden', !show);
        refs.weatherCard.classList.toggle('hidden', show);
        if(show){
            refs.weatherCard.classList.add('hidden');
            refs.weatherCard.classList.remove('loaded');
        }
    }

    function setUnitButtons(){
        if(units === 'metric'){
            refs.unitC.classList.add('active'); refs.unitF.classList.remove('active');
        } else {
            refs.unitF.classList.add('active'); refs.unitC.classList.remove('active');
        }
    }

    async function fetchJSON(url){
        const res = await fetch(url);
        if(!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    }

    function renderCurrent(data){
        refs.weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">`;
        refs.loc.textContent = `${data.name}, ${data.sys.country}`;
        refs.temp.textContent = `${Math.round(data.main.temp)}°${units==='metric'?'C':'F'}`;
        refs.desc.textContent = data.weather[0].description.replace(/\b\w/g, c => c.toUpperCase());

        // Arrange details in two columns: left = Humidity, Feels like; right = Wind, Clouds
        const clouds = data.clouds && (data.clouds.all !== undefined) ? `${data.clouds.all}%` : 'N/A';
        refs.details.innerHTML = `
            <div class="icon-label"><span class="material-icons">water_drop</span>Humidity: ${data.main.humidity}%</div>
            <div class="icon-label"><span class="material-icons">thermostat</span>Feels like: ${Math.round(data.main.feels_like)}°</div>
            <div class="icon-label"><span class="material-icons">air</span>Wind: ${Math.round(data.wind.speed)} ${units==='metric'?'m/s':'mph'}</div>
            <div class="icon-label"><span class="material-icons">cloud</span>Clouds: ${clouds}</div>
        `;
        refs.weatherCard.classList.remove('hidden');
        // trigger entrance animations
        requestAnimationFrame(()=> refs.weatherCard.classList.add('loaded'));

        // populate expanded details (hidden by default)
        if(refs.cardExtra){
            const visibility = data.visibility ? `${Math.round(data.visibility/1000*10)/10} km` : 'N/A';
            const pressure = data.main && data.main.pressure ? `${data.main.pressure} hPa` : 'N/A';
            const sunrise = data.sys && data.sys.sunrise ? new Date(data.sys.sunrise*1000).toLocaleTimeString() : 'N/A';
            const sunset = data.sys && data.sys.sunset ? new Date(data.sys.sunset*1000).toLocaleTimeString() : 'N/A';
            const windDir = data.wind && data.wind.deg ? degToCompass(data.wind.deg) : 'N/A';
            const feelsLike = data.main && data.main.feels_like ? `${Math.round(data.main.feels_like)}°${units==='metric'?'C':'F'}` : 'N/A';
            const range = data.main ? `${Math.round(data.main.temp_min)}°${units==='metric'?'C':'F'} - ${Math.round(data.main.temp_max)}°${units==='metric'?'C':'F'}` : 'N/A';
            const description = data.weather && data.weather[0] ? data.weather[0].description : 'N/A';
            refs.cardExtra.innerHTML = `
                <h3>Detailed Weather Card</h3>
                <div class="card-extra-grid">
                    <div class="card-extra-item"><strong>Description</strong>${description}</div>
                    <div class="card-extra-item"><strong>Feels like</strong>${feelsLike}</div>
                    <div class="card-extra-item"><strong>Range</strong>${range}</div>
                    <div class="card-extra-item"><strong>Pressure</strong>${pressure}</div>
                    <div class="card-extra-item"><strong>Visibility</strong>${visibility}</div>
                    <div class="card-extra-item"><strong>Wind</strong>${Math.round(data.wind.speed)} ${units==='metric'?'m/s':'mph'} · ${windDir}</div>
                    <div class="card-extra-item"><strong>Sunrise</strong>${sunrise}</div>
                    <div class="card-extra-item"><strong>Sunset</strong>${sunset}</div>
                </div>
                <div class="card-extra-item"><strong>Cloud cover</strong>${data.clouds && data.clouds.all !== undefined ? `${data.clouds.all}%` : 'N/A'}</div>
            `;
            refs.cardExtra.classList.add('hidden');
            refs.cardExtra.setAttribute('aria-hidden','true');
        }
    }

    function degToCompass(num) {
        const val = Math.floor((num / 22.5) + 0.5);
        const arr = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
        return arr[(val % 16)];
    }

    function renderForecast(forecastData){
        // pick entries around 12:00 each day
        const byDay = {};
        forecastData.list.forEach(item => {
            const day = item.dt_txt.split(' ')[0];
            const hour = item.dt_txt.split(' ')[1];
            if(!byDay[day]) byDay[day]=[];
            byDay[day].push(item);
        });

        const cards = Object.keys(byDay).slice(0,7).map(day => {
            // prefer midday entry
            const midday = byDay[day].find(i=>i.dt_txt.includes('12:00:00')) || byDay[day][0];
            const d = new Date(midday.dt*1000);
            const label = d.toLocaleDateString(undefined,{weekday:'short'});
            return `
                <div class="day">
                    <div class="day-label">${label}</div>
                    <img src="https://openweathermap.org/img/wn/${midday.weather[0].icon}@2x.png" alt="${midday.weather[0].description}" style="width:48px">
                    <div class="day-temp">${Math.round(midday.main.temp)}°</div>
                    <div class="day-desc" style="opacity:0.9">${midday.weather[0].description}</div>
                </div>
            `;
        }).join('');

        refs.forecast.innerHTML = cards;
    }

    async function getWeather(city){
        if(!city) return showError('Please enter a city');
        showLoading(true);
        try{
            const current = await fetchJSON(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`);
            renderCurrent(current);

            // forecast
            const lat = current.coord.lat, lon = current.coord.lon;
            const forecast = await fetchJSON(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`);
            renderForecast(forecast);

            localStorage.setItem('lastCity', city);
        }catch(err){
            showError(err.message || 'Could not fetch weather');
        }finally{
            showLoading(false);
        }
    }

    function showError(msg){
        refs.weatherCard.classList.add('hidden');
        refs.forecast.innerHTML = `<div style="padding:12px;background:rgba(255,0,0,0.06);border-radius:8px">${msg}</div>`;
        refs.loading.classList.add('hidden');
    }

    // events
    refs.searchBtn.addEventListener('click', ()=> getWeather(refs.city.value.trim()));
    refs.city.addEventListener('keydown', e=>{ if(e.key==='Enter') getWeather(refs.city.value.trim()) });
    refs.lastBtn.addEventListener('click', ()=>{
        const last = localStorage.getItem('lastCity');
        if(last){ refs.city.value = last; getWeather(last); }
    });

    refs.unitC.addEventListener('click', ()=>{ units='metric'; localStorage.setItem('units',units); setUnitButtons(); const last=localStorage.getItem('lastCity'); if(last) getWeather(last); });
    refs.unitF.addEventListener('click', ()=>{ units='imperial'; localStorage.setItem('units',units); setUnitButtons(); const last=localStorage.getItem('lastCity'); if(last) getWeather(last); });

    // initialize with last city if present
    const last = localStorage.getItem('lastCity');
    if(last){ refs.city.value = last; getWeather(last); }

    // expose for debugging
    window.getWeather = getWeather;
    // survey button: navigate to survey page
    const surveyBtn = document.getElementById('backToTop');
    if(surveyBtn){ surveyBtn.addEventListener('click', ()=>{ window.location.href = 'survey.html'; }); }

    // toggle expanded details when clicking the weather card (except interactive controls)
    if(refs.weatherCard){
        refs.weatherCard.addEventListener('click', (e)=>{
            // ignore clicks on buttons or links inside the card
            if(e.target.closest('button') || e.target.closest('a')) return;
            if(!refs.cardExtra) return;
            const hidden = refs.cardExtra.classList.toggle('hidden');
            refs.cardExtra.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        });
    }
})();