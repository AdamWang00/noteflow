# noteflow
Built by Adam Wang, Manoj Niverthi, Michael Tang, Sidhesh Desai, & Jonathan Zheng

## Try our application!
[noteflow-bitrate.web.app](http://noteflow-bitrate.web.app/) (Chrome or Firefox recommended -- known issues with Safari)

## Inspiration

All of us are makers of music, either as listeners of music or instrumentalists, and we all feel that a common problem faced by many musicians and composers today is a lack of sources of inspiration. To tackle that problem, we wanted to create a platform that uses machine learning to spark new ideas while enabling brainstorming and collaboration between musicians. Our goal is to make Noteflow a **versatile browser platform** that not only **experienced artists could incorporate in their workflows**, but also **beginners could use meaningfully and with ease**.

## What it does

Noteflow is an ML-assisted music notebook designed with collaboration and simplicity in mind. **Magenta-generated melodies are parsed and converted into notes and rests on a musical staff** for convenience and readability, since we want users to be able to play the melody on, for example, a piano.

Our app also allows users to **play back their generated melodies** using Tone.js, highlighting the notes as they are played. Options for **key, tempo, and temperature** (i.e. “randomness”) allows users to mold the generated melodies to perfectly fit their creative ideas or existing projects.

By utilizing the functionality of our backend API, **Noteflow allows users to save, load, and share melodies created in their notebooks, as well as to import melodies created by others** via unique melody IDs. Loaded/imported melodies can be played back in the original key and tempo that the melody was saved in.

## How we built it

**Frontend:** Our client is built using React and Bootstrap and is hosted on Firebase ([view Noteflow here](http://noteflow-bitrate.web.app/)). We used VexFlow for formatting the staff and notational representation, Tone.js in order to enable MIDI processing and playback of our note sequences, and Magenta.js’s MelodyRNN model in order to create monophonic melodies, which users can save, load, and share via functionalities provided by our backend. We also wrote our own mini-library for handling pitch-to-note transcription and key signatures (e.g. adding sharps, flats, and naturals to notes on the staff where needed).

**Backend:** Our server endpoint is implemented with Flask and SQLite3 and is hosted on AWS. We developed an API endpoint from scratch in order to manage user accounts and authentication, as well as to add functionality for saving, loading, deleting, and sharing saved melodies stored in our database. It accomplishes these tasks using JWT tokens (stored by the client as a browser cookie), as well as serialization techniques for melody data.

## Challenges we ran into

* Initially, it was difficult for us to come to common ground on the direction to take the project, but ultimately we were able to focus our efforts on a core set of features that we thought were most important.

* As students with limited experience with web technologies and hosting services (with some of us using JavaScript for the first time), we had to learn as we built -- which created some delays in our planned schedule -- but was ultimately very rewarding for all of us.

* Like many other teams, this was our first remote hackathon, which required us to explore different approaches to splitting up tasks and merging codebases.

* We also ran into issues with time since most of us had already started school in mid-August, though in the end we were able to complete our application on time -- **though not without some late night coding** :)

## Accomplishments that we’re proud of

* We are proud of the overall result of the project and how we were able to combine multiple different technologies we were unfamiliar with (such as Magenta, Tone, and VexFlow) into one cohesive product entirely from scratch.

* As musicians ourselves, we were able to use our knowledge of music theory and composition to develop our own **mini-library for pitch-to-note transcription and key signature handling** so that we could accurately and efficiently render melodies on a staff -- a **distinctive functionality** of the project that we are proud of and feel should not be overlooked.

* Since our team consists of 2 cellists, 2 clarinetists, and 1 pianist, we were able to play melodies generated and transcribed by Noteflow on our own instruments. We were able to build a creative, functional application that all of us enjoyed using, and we hope others do too!

## What we learned

As a group, we all gained invaluable experience with the technologies we used on this project, from Magenta.js and Tone.js to client-server communication and user authentication with React and Flask. We also learned about music theory and **implementing algorithms and data structures for parsing and storing melody data**. Most of all, as students with limited experience, we gained a lot of **insight into the web app development process**, from designing the project framework to coding and debugging to testing and deploying.

## What’s next

As we’ve said above, our main goal is to make integrating Noteflow into a composer/producer's workflow as seamless as possible. As such, we hope to be able to improve the machine learning models to make melody creation even more customizable, whether it’s by adding adjusters for melody length and range or by creating ML models to learn the different composition styles of each user in the Flask backend. Some other features that we plan to implement in the future include integration with social media platforms and note-labelling & tooltips for accessibility.
