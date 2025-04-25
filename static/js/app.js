$(document).ready(function () {
  // ✅ 1. 翻页时钟初始化（ID选择器注意一致）
  const clock = $('#flipclock').FlipClock({
    clockFace: 'TwentyFourHourClock',
    showSeconds: true,
    autoStart: true
  });

  // ✅ 当前日期文字
  const now = new Date();
  $('.current-date').text(
  `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${'日一二三四五六'[now.getDay()]}`
);


  // ✅ 2. 专注模式计时器（25分钟倒计时 + 提示音 + 弹窗）
  let focusTime = 25 * 60;
  let focusInterval;
  const $focusTimer = $('#focus-timer');
  const focusAudio = new Audio('/static/audio/focus.mp3');

  function updateFocusDisplay() {
    const m = Math.floor(focusTime / 60);
    const s = focusTime % 60;
    $focusTimer.text(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
  }

  $('#focus .control-btn').click(function () {
    clearInterval(focusInterval);
    focusTime = 25 * 60;
    updateFocusDisplay();

    focusInterval = setInterval(() => {
      focusTime--;
      updateFocusDisplay();
      if (focusTime <= 0) {
        clearInterval(focusInterval);
        $('.alert-overlay').fadeIn();
        focusAudio.play();
      }
    }, 1000);
  });

  $('.alert-overlay').click(() => $('.alert-overlay').fadeOut());

  // ✅ 3. 提醒事项（到点播放闹钟）
  let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  const alarmAudio = new Audio('/static/audio/alarm.mp3');
  let triggeredToday = new Set();

  function renderReminders() {
    const $list = $('#alarm .reminder-list').empty();
    reminders.forEach((r, i) => {
     $list.append(`<div>${r.time} - ${r.text} <button data-i="${i}">×</button></div>`);

    });
  }

  $('#alarm .control-btn').click(function () {
    const text = $('#reminder-text').val().trim();
    const time = $('#alarm-time').val();
    if (!text || !time) return;

    reminders.push({ text, time });
    localStorage.setItem('reminders', JSON.stringify(reminders));
    $('#reminder-text').val('');
    renderReminders();
  });

  $('#alarm .reminder-list').on('click', 'button', function () {
    const i = $(this).data('i');
    reminders.splice(i, 1);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    renderReminders();
  });

  // 每分钟检查提醒
  setInterval(() => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hh}:${mm}`;
    reminders.forEach(r => {
      if (r.time === currentTime) alarmAudio.play();
    });
  }, 60000);

  renderReminders();



  // ✅ 4. 背景音乐播放（放松/专注 + 播放按钮）
  const musicPlayer = new Audio();
  let currentMode = null;

  $('#music-control button[data-mode]').click(function () {
    const mode = $(this).data('mode');
    currentMode = mode;
    musicPlayer.src = `/static/audio/${mode}.mp3`;
    musicPlayer.loop = true;
    musicPlayer.play();
  });




   $('#music-btn').click(() => {
    if (!currentMode) return alert("请先选择一个模式");
    if (musicPlayer.paused) {
      musicPlayer.play();
      $('#music-btn').text('暂停音乐');
    } else {
      musicPlayer.pause();
      $('#music-btn').text('播放音乐');
    }
  });
  // ✅ 5. 成绩记录 + 项目笔记自动本地保存
  $('#score-record textarea')
    .val(localStorage.getItem('score') || '')
    .on('input', function () {
      localStorage.setItem('score', $(this).val());
    });

  $('#notes textarea')
    .val(localStorage.getItem('notes') || '')
    .on('input', function () {
      localStorage.setItem('notes', $(this).val());
    });
});
  // 每天清空已触发的提醒
  function clearDailyTriggers() {
    const today = new Date().toDateString();
    if (localStorage.getItem('lastTriggerClear') !== today) {
      triggeredToday.clear();
      localStorage.setItem('lastTriggerClear', today);
    }
  }
  clearDailyTriggers();




