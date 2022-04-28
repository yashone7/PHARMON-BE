# PHARMON

A NodeJS based web application that allows pharma companies to keep track of their employees work record

## Tech stack used

-ExpressJS - for writing APIs
-ReactJS - front end
-Redux - state management
-React-Map-GL - (Uber open source) A react wrapper for creating maps
-Deck.gl - (Uber open source) WebGL powered visualizations
-ReCharts - a charting library
-Bulma - For Styling
-Lodash - ultilities
-JWT - authetication
-React Datepicker - dates
-Date fns - Date and time utility
-axios - network requests
-tailwindcss - Styling
-Fuze.js - Implementing fuzzy search

## End points

The endpoints are as follows /api/(resource_name)

/api/doctors - POST - used for creating new doctor
/api/employees - POST - used for creating a new employee
/api/chemists - POST - used for creating a new chemist
/api/distributors - POST - used for creating a new distributor
/api/employees/territory - POST - used to assign territory to employee
/api/employees/sale - POST - admin can post employees' sale record

these endpoints are protected and only admin has the previleges to access them

/api/employees/work - POST - employees can post their work record

## Fuzzy search libraries

FuseJS is an excellent option to perform search!

LUNR JS is also a good alternative too.
