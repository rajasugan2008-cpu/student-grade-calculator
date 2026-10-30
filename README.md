# 🎓 Student Grade Calculator

A responsive web app that turns subject marks into percentages, grades and a clear **PASS / FAIL** result. Built with plain HTML, CSS and vanilla JavaScript: no frameworks, no build tools, no dependencies.

## Overview

Enter a student's name, add any number of subjects with maximum and obtained marks, and press **Calculate results**. The app shows summary cards, a subject-wise results table and a printable report. Inputs are saved in your browser, so they are still there after a refresh.

## Features

- Student name and optional class or department
- Add and remove any number of subjects
- Total obtained, total maximum, overall percentage and average subject percentage
- Subject-wise percentage, grade and pass/fail badge
- Overall grade and overall PASS/FAIL status
- Friendly validation messages with highlighted fields
- Reset All with confirmation
- Print Results with a clean report layout
- LocalStorage persistence with safe handling of corrupted data
- Responsive layout for desktop, tablet and mobile
- Accessible labels, keyboard navigation and visible focus styles
- Empty states and a "Load sample data" shortcut

## Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, custom properties, print styles)
- Vanilla JavaScript (ES6)

## File Structure

```
student-grade-calculator/
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore
```

## Run Locally

1. Download or clone the repository:
   ```bash
   git clone https://github.com/rajasugan2008-cpu/student-grade-calculator.git
   ```
2. Open the `student-grade-calculator` folder.
3. Double-click `index.html` to open it in a modern browser (Chrome, Edge, Firefox or Safari).

No installation is needed.

## How to Use

1. Type the student name and, optionally, the class or department.
2. Fill in the first subject: name, maximum marks and obtained marks.
3. Choose **+ Add subject** for more subjects, or **✕** to remove one.
4. Choose **Calculate results**.
5. Review the summary cards and the subject-wise table.
6. Choose **Print results** to print or save the report as a PDF.
7. Choose **Reset all** (and confirm) to clear everything.

## Calculation Formula and Grading Scale

```
Subject Percentage = (Obtained Marks / Maximum Marks) × 100
Overall Percentage = (Total Obtained Marks / Total Maximum Marks) × 100
Average Subject Percentage = sum of subject percentages / number of subjects
```

| Grade | Percentage |
|-------|------------|
| A | 90% and above |
| B | 80% to below 90% |
| C | 70% to below 80% |
| D | 60% to below 70% |
| E | 40% to below 60% |
| F | Below 40% |

- A subject **passes at 40% or above** and fails below 40%.
- The **overall grade** is based on the overall percentage.
- The overall result is **PASS only when every subject passes**; otherwise it is **FAIL**.

> **Note:** Institutions use different grading systems. All thresholds live in one object, `GRADING_SCALE`, at the top of `script.js`. Edit it to match your school or university.

## LocalStorage Privacy Note

Your inputs are saved with the browser's LocalStorage. This data stays **in your own browser on your own device**. It is not sent to any server, and this project has no backend. Clearing your browser data, using private browsing, or pressing **Reset all** removes it.

## Testing Checklist

Use **Load sample data** or enter these values:

| Subject | Obtained / Max |
|---------|----------------|
| Mathematics | 80 / 100 |
| Physics | 35 / 100 |
| Chemistry | 90 / 100 |

Expected results:

- [ ] Total obtained: 205
- [ ] Total maximum: 300
- [ ] Overall percentage: 68.33%
- [ ] Average subject percentage: 68.33%
- [ ] Grades: Mathematics B, Physics F, Chemistry A
- [ ] Overall grade: D
- [ ] Overall status: FAIL

Other checks:

- [ ] Empty subject name shows an error
- [ ] Maximum marks of 0 shows an error
- [ ] Negative marks show an error
- [ ] Obtained marks above maximum show an error
- [ ] Calculating with no subjects shows an error
- [ ] Refreshing the page keeps inputs and results
- [ ] Reset all asks for confirmation and clears saved data
- [ ] Print preview shows only the report
- [ ] Layout works on a narrow mobile screen
- [ ] All controls work with the keyboard (Tab, Enter, Space)

## Enable GitHub Pages

1. Open your repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**, then click **Save**.
5. Wait a minute or two, then refresh the page. GitHub shows the live site URL there.

## Future Improvements

- Custom grading scale editor in the interface
- Weighted subjects and credit hours
- GPA calculation
- Export results as PDF or CSV
- Save and compare multiple students
- Dark mode

## Author

**Rajasugan K**
GitHub: [https://github.com/rajasugan2008-cpu](https://github.com/rajasugan2008-cpu)
