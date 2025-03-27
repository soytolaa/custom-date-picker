function createCalendarPicker($input) {
  let currentYear, currentMonth;
  let $calendarWrap; // Will hold the calendar container

  // Parse initial date from input or default to today
  function getInitialDate() {
    const inputValue = $input.val();
    if (inputValue && /^\d{4}-\d{2}-\d{2}$/.test(inputValue)) {
      const initialDate = new Date(inputValue);
      if (!isNaN(initialDate.getTime())) return initialDate;
    }
    return new Date();
  }

  // Generate year options for dropdown
  function generateYearOptions(selectedYear) {
    let options = "";
    for (let i = selectedYear - 10; i <= selectedYear + 10; i++) {
      options += `<option value="${i}" ${
        i === selectedYear ? "selected" : ""
      }>${i}</option>`;
    }
    return options;
  }

  // Generate month options for dropdown
  function generateMonthOptions(selectedMonth) {
    let options = "";
    for (let i = 0; i < 12; i++) {
      options += `<option value="${i}" ${
        i === selectedMonth ? "selected" : ""
      }>${i + 1}</option>`;
    }
    return options;
  }

  // Generate calendar grid
  function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();
    let calendarHTML = "";
    let dayCount = 1;
    let nextMonthDays = 1;
    const selectedDateStr = $input.val();
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      let row = "<div>";
      for (let j = 0; j < 7; j++) {
        let isHoliday = j === 0 || j === 6 ? "calendar_holiday" : "";
        let classes = [isHoliday];

        if (i === 0 && j < firstDay) {
          const day = prevLastDate - firstDay + j + 1;
          const prevMonth = month === 0 ? 11 : month - 1;
          const prevYear = month === 0 ? year - 1 : year;
          const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          classes.push("futureDay");
          row += `<a href="#none" class="${classes.join(
            " "
          )}" data-date="${dateStr}" data-month="${prevMonth}" data-year="${prevYear}">${day}</a>`;
        } else if (dayCount > lastDate) {
          const nextMonth = month === 11 ? 0 : month + 1;
          const nextYear = month === 11 ? year + 1 : year;
          const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(
            2,
            "0"
          )}-${String(nextMonthDays).padStart(2, "0")}`;
          classes.push("futureDay");
          row += `<a href="#none" class="${classes.join(
            " "
          )}" data-date="${dateStr}" data-month="${nextMonth}" data-year="${nextYear}">${nextMonthDays++}</a>`;
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(dayCount).padStart(2, "0")}`;
          let isToday =
            year === today.getFullYear() &&
            month === today.getMonth() &&
            dayCount === today.getDate();
          let isSelected = dateStr === selectedDateStr;
          if (isToday) classes.push("nowDay");
          if (isSelected) classes.push("selected");
          row += `<a href="#none" class="${classes.join(
            " "
          )}" data-date="${dateStr}" data-month="${month}" data-year="${year}">${dayCount++}</a>`;
        }
      }
      row += "</div>";
      calendarHTML += row;
    }
    $calendarWrap.find(".calendar_body dd").html(calendarHTML);
    $calendarWrap.find("#yearSelect").html(generateYearOptions(year));
    $calendarWrap.find("#monthSelect").html(generateMonthOptions(month));
  }

  // Create the calendar HTML structure dynamically
  function createCalendarHTML() {
    const calendarHTML = `
        <div class="calendar-picker" style="display: none; position: absolute; background: #fff; border: 1px solid #ccc; z-index: 1000;">
          <div class="calendar_head" style="display: flex; justify-content: space-between; padding: 10px;">
            <a href="#none" class="bt_calendar_prev" style="cursor: pointer;">&lt;</a>
            <div class="calendar_tit">
              <select id="yearSelect"></select>
              <select id="monthSelect"></select>
            </div>
            <a href="#none" class="bt_calendar_next" style="cursor: pointer;">&gt;</a>
          </div>
          <div class="calendar_body">
            <dl style="margin: 0;">
              <dt style="display: flex; justify-content: space-between; padding: 5px;">
                <span class="calendar_holiday">Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span class="calendar_holiday">Sat</span>
              </dt>
              <dd class="grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; padding: 5px;"></dd>
            </dl>
          </div>
          <div class="calendar_foot" style="padding: 10px; text-align: right;">
            <a href="#none" class="close-btn" style="padding: 5px 10px; background: #eee; text-decoration: none; color: #000;">Close</a>
          </div>
        </div>
      `;
    $calendarWrap = $(calendarHTML).insertAfter($input); // Insert after the input
  }

  // Initialize the calendar
  function initCalendar() {
    const initialDate = getInitialDate();
    currentYear = initialDate.getFullYear();
    currentMonth = initialDate.getMonth();
    generateCalendar(currentYear, currentMonth);
  }

  // Format input as yyyy-mm-dd while typing
  function formatDateInput() {
    $input.on("input", function () {
      let value = $(this)
        .val()
        .replace(/[^0-9]/g, "");
      if (value.length > 8) value = value.slice(0, 8);
      let formatted = "";
      if (value.length >= 4) {
        formatted += value.slice(0, 4);
        if (value.length >= 5) {
          formatted += "-" + value.slice(4, 6);
          if (value.length >= 7) {
            formatted += "-" + value.slice(6, 8);
          }
        }
      } else {
        formatted = value;
      }
      $(this).val(formatted);
    });
  }

  // Set up event handlers
  function setupEvents() {
    // Show calendar on input click
    $input.on("click", function (e) {
      e.stopPropagation();
      $calendarWrap.show();
      initCalendar();
    });

    // Previous month
    $calendarWrap.find(".bt_calendar_prev").on("click", function () {
      currentMonth--;
      if (currentMonth < 0) {
        currentYear--;
        currentMonth = 11;
      }
      generateCalendar(currentYear, currentMonth);
    });

    // Next month
    $calendarWrap.find(".bt_calendar_next").on("click", function () {
      currentMonth++;
      if (currentMonth > 11) {
        currentYear++;
        currentMonth = 0;
      }
      generateCalendar(currentYear, currentMonth);
    });

    // Year/Month dropdown change
    $calendarWrap.find("#yearSelect, #monthSelect").on("change", function () {
      currentYear = parseInt($calendarWrap.find("#yearSelect").val());
      currentMonth = parseInt($calendarWrap.find("#monthSelect").val());
      generateCalendar(currentYear, currentMonth);
    });

    // Date selection
    $calendarWrap.find(".calendar_body").on("click", "a", function (e) {
      e.preventDefault();
      const dateStr = $(this).data("date");
      const clickedMonth = parseInt($(this).data("month"));
      const clickedYear = parseInt($(this).data("year"));

      if ($(this).hasClass("futureDay")) {
        currentYear = clickedYear;
        currentMonth = clickedMonth;
        generateCalendar(currentYear, currentMonth);
      } else {
        $calendarWrap.find(".calendar_body a").removeClass("selected");
        $(this).addClass("selected");
        $input.val(dateStr).trigger("change");
        $calendarWrap.hide();
      }
    });

    // Close button
    $calendarWrap.find(".close-btn").on("click", function (e) {
      e.preventDefault();
      $calendarWrap.hide();
    });

    // Hide calendar when clicking outside
    $(document).on("click", function (e) {
      if (
        !$(e.target).closest($input).length &&
        !$(e.target).closest($calendarWrap).length
      ) {
        $calendarWrap.hide();
      }
    });

    formatDateInput();
  }

  // Initialize everything
  createCalendarHTML();
  initCalendar();
  setupEvents();

  // Return public API
  return {
    getDate: function () {
      return $input.val();
    },
    destroy: function () {
      $calendarWrap.remove(); // Clean up the DOM
      $input.off(); // Remove all event listeners from input
    },
  };
}

// Usage:
$(document).ready(function () {
  let picker = createCalendarPicker($("#dateInput"));
  $("#dateInput").on("change", function () {
    console.log("Selected date:", picker.getDate());
  });
});
