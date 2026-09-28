<img width="1758" height="823" alt="image" src="https://github.com/user-attachments/assets/8571fd04-f051-48b6-a509-0208a62c7941" />

Course encryption program; encrypt and decrypt a course code from different paramters based on cities and states too. 

COURSES AND ROOMS
 rooms = {
        "CS101": 3004,
        "CS102": 4501,
        "CS103": 6755,
        "NT110": 1244,
        "CM241": 1411
    }

    instructors = {
        "CS101": "Haynes",
        "CS102": "Alvarado",
        "CS103": "Rich",
        "NT110": "Burke",
        "CM241": "Lee"
    }

    meeting_times = {
        "CS101": "8:00 a.m.",
        "CS102": "9:00 a.m.",
        "CS103": "10:00 a.m.",
        "NT110": "11:00 a.m.",
        "CM241": "1:00 p.m."
    }

    Another dictionaries consits of 52 states and their capitals; 

## Web front-end (localhost)

A static page for the program lives in `web/` (plain HTML/CSS/JS, no build step). It implements "Course Encryption App v2" and `design.md` from the Claude Design project (also exported in `Course encryption web wireframe.zip`).

```
python serve.py          # opens http://localhost:5000/
python serve.py 8080     # use another port
```

Screens: **Home**, **Encrypt / Decrypt** (load a `.txt`, use `original.txt`, save/copy the result, code table), **Course info**, **Capital quiz**.
The server also serves the repo's `original.txt` and `encrypted.txt`, so "Use original.txt" reads the real file. Opening `web/index.html` directly works too; it then falls back to a built-in copy of `original.txt`.

Characters highlighted in amber can't be reversed exactly: `k` has no code (it is dropped), and several letters encode to digits (`a→9`, `c→0`, `R→1`, …), so a digit in cipher text may be a real digit or an encoded letter.
