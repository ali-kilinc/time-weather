# time-weather
A simple web application which gives current time and weather for locations given as an array of inputs (location name, postal code).
Inputs should be given in following formats (comma seperated);

- city only -> *Ankara*
- postal code only -> *83254* (default country code US will be used in this case)
- city and postal code -> *Istanbul, 34091*

### Input
	Dubai, Nowhere Town, Istanbul, 34091, 83254
### Output
	Dubai ==> Time: 15.07.2020 15:52:56 / UTC+4, Weather: Clear, 39 C
	Something went wrong for Nowhere Town :Not Found
	Istanbul 34091, Karagümrük ==> Time: 15.07.2020 14:52:56 / UTC+3, Weather: Clouds, 23 C
	83254, Montpelier ==> Time: 15.07.2020 05:54:51 / UTC-6, Weather: Clear, 4 C
	
Follow [this link](http://ali.kilinc.me/aa9dj6sf/) to see the working application.
