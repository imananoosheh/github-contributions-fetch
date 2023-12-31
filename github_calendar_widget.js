// github_calendar_widget.js
const monthsMap = {
	0: "Jan",
	1: "Feb",
	2: "Mar",
	3: "Apr",
	4: "May",
	5: "Jun",
	6: "Jul",
	7: "Aug",
	8: "Sep",
	9: "Oct",
	10: "Nov",
	11: "Dec",
};

/**
 * Function to render the GitHub Activity Calendar.
 * @param {Array} contributionData - Array of GitHub contribution data.
 * @param {Object} options - Options for customizing the calendar appearance.
 */
function renderCalendar(contributionData, options) {
	const today = new Date();
	today.setDate(today.getDate() - 365);
	const startingMonth = today.getMonth();
	const calendarComponent = document.getElementById("calendar-component");
	const calendarHeader = document.createElement("h1");
	calendarHeader.textContent = "GitHub Activity Calendar";
	calendarComponent.append(calendarHeader);
	const calendarMonthsTemplate = document.createElement("div");
	calendarMonthsTemplate.className = "months";
	for (let i = 0; i < 13; i++) {
		const month = document.createElement("div");
		month.className = "month";
		const currentMonth =
			i + startingMonth > 11 ? i + startingMonth - 12 : i + startingMonth;
		month.textContent = `${monthsMap[currentMonth]}`;
		calendarMonthsTemplate.append(month);
	}
	calendarComponent.append(calendarMonthsTemplate);
	const calendarDaysTemplate = document.createElement("div");
	calendarDaysTemplate.className = "calendar-wrapper";
	const calendarDaysAsideBlock = document.createElement("aside");
	const daysOfWeeks = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
	for (let i = 0; i < 7; i++) {
		const day = document.createElement("div");
		day.textContent = `${daysOfWeeks[i]}`;
		calendarDaysAsideBlock.append(day);
	}
	calendarDaysTemplate.append(calendarDaysAsideBlock);
	const calendar = document.createElement("div");
	calendar.id = "calendar";
	calendar.innerHTML = "";
	calendarDaysTemplate.append(calendar);
	calendarComponent.append(calendarDaysTemplate);

	/**
	 * Function to convert a floating-point number to hexadecimal.
	 * @param {number} floatingNumber - The floating-point number (0.00 to 1.00).
	 * @returns {string} - The hexadecimal representation (00 to FF).
	 */
	function floatToHex(floatingNumber) {
		//Ensuring more than threshold gets colored with no opacity (FF <===> alpha-value: 0)
		if (floatingNumber >= 1) {
			return "FF";
		}
		// Ensure the input is in the valid range
		if (floatingNumber < 0) {
			throw new Error("Input must be in the range of 0.00 to 1.00");
		}
		// Convert the floating-point number to an integer in the range 0 to 255
		const intValue = Math.round(floatingNumber * 255);
		// Convert the integer to a hexadecimal string
		const hexString = intValue.toString(16).padStart(2, "0").toUpperCase();
		return hexString;
	}

	// Generate calendar grid
	for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
		for (let week = 0; week < 53; week++) {
			const dayElement = document.createElement("div");
			dayElement.classList.add("day");
			const currentDate = new Date();
			currentDate.setDate(
				currentDate.getDate() - 365 + (dayOfWeek + week * 7)
			);

			const currentISODate = currentDate.toISOString().split("T")[0];
			const data = contributionData.find(
				(entry) => entry.date === currentISODate
			);
			//Add gradiant proportionate to contribution count
			if (data && data.contributionCount > 0) {
				const colorIntensity = data.contributionCount / 10.0; // Adjust color intensity based on contributionCount
				dayElement.setAttribute(
					"style",
					`background-color:${
						options["themeColor"] + floatToHex(colorIntensity)
					};
					align-content: baseline;`
				); // Use color from data or default color
			}
			dayElement.setAttribute(
				"date",
				currentDate.toLocaleDateString("en-US", {
					month: "short",
					day: "2-digit",
				})
			);
			if (data) {
				dayElement.setAttribute(
					"contributions",
					data.contributionCount
				);
				if (data.contributionCount >= 10) {
					dayElement.textContent = "*";
				}
			}
			const today = new Date();
			if (currentDate > today) {
				dayElement.style.backgroundColor = "transparent";
				dayElement.style.border = "0px";
			}
			calendar.appendChild(dayElement);
		}
	}

	const styles = `
  body{
	background-color: ${options["backgroundColor"]};
  	color: ${options["themeColor"]};
  }
  #calendar {
    display: grid;
    /* 53 columns for each week in a year */
    grid-template-columns: repeat(53, 1rem);
    /* 7 rows for each day of the week */
    grid-template-rows: repeat(7, 1rem);
    gap: 2px;
  }
  
  .day {
    width: 1rem;
    height: 1rem;
    border: 1px solid ${options["themeColor"] + "80"};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    background-color: rgba(0, 0, 0, 0.5);
	color: black;
	font-weight: bold;
  }
  .day:hover::after {
    content: attr(contributions) " contributions on " attr(date);
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translate(-50%, -60px);
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 5px;
    white-space: nowrap;
    color: ${options["backgroundColor"]};
	font-weight: normal;
    z-index: 5;
  }
  .calendar-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .calendar-wrapper aside {
    padding-right: 1rem;
    text-align: right;
    width: 2rem;
  }
  .calendar-wrapper aside div {
    width: 1rem;
    height: 1rem;
	margin-bottom: 2px;
  	line-height: 1rem;
  }
  .months {
    display: flex;
    flex-direction: row;
    justify-content: start;
    margin-left: 4rem;
  }
  .month {
    width: 4.75rem;
	text-align: left;
  }
  #calendar-component{
    margin: 3rem 0;
    font-size: 1rem;
	width: fit-content;
  }
  #calendar-component > h1{
    margin-bottom: 0.5rem;
    text-align: center;
  }
  `;
	// Apply styles to the document
	const styleElement = document.createElement("style");
	styleElement.textContent = styles;
	document.head.appendChild(styleElement);
}

/**
 * Function to fetch data from the GitHub API.
 * @param {string} username - GitHub username.
 * @returns {Promise} - A promise that resolves to the GitHub contribution data.
 */
async function fetchDataFromServer(username) {
	const response = await fetch(
		`https://nulljuju.dev/github_calendar/${username}`,
		{
			method: "GET", // *GET, POST, PUT, DELETE, etc.
			mode: "cors", // no-cors, *cors, same-origin
			cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	const data = await response.json();
	if (data && response.status === 200) {
		return data;
	} else {
		console.error("Error in fetching GitHub data from server");
	}
}

/**
 * Function to generate the GitHub Activity Calendar on the frontend.
 * @param {string} username - GitHub username.
 * @param {Object} options - Options for customizing the calendar appearance.
 */
async function generateCalendar(username, options) {
	try {
		const contributionData = await fetchDataFromServer(username);
		if (!contributionData || contributionData.length === 0) {
			console.error("No contribution data available.");
			// Handle the error or do something else
			return;
		}

		renderCalendar(contributionData, options);
	} catch (error) {
		console.error("Error fetching contribution data:", error);
	}
}

/**
 * Function to initialize the GitHub Activity Calendar.
 */
function initGitHubCalendar() {
	let ghCalCompIsLoaded =
		document.getElementById("calendar-component") === null ? false : true;
	while (!ghCalCompIsLoaded) {
		setTimeout(() => {
			ghCalCompIsLoaded =
				document.getElementById("calendar-component") === null
					? false
					: true;
			console.log("Waiting for all HTML load...");
		}, 500);
	}
	const calendarComponent = document.getElementById("calendar-component");
	if (calendarComponent) {
		const username = calendarComponent.getAttribute("username");
		const themeColor = calendarComponent.getAttribute("theme-color");
		const backgroundColor =
			calendarComponent.getAttribute("background-color");
		const options = {
			themeColor: themeColor === null ? "#00ff00" : themeColor,
			backgroundColor:
				backgroundColor === null ? "#121212" : backgroundColor,
		};
		if (username.length > 0) {
			console.log("Generating the GitHub Calendar ...");
			generateCalendar(username, options);
		} else {
			console.error(
				"Username was not provided!\n",
				`username fetched:${username}\n`
			);
		}
	}
}
initGitHubCalendar();
