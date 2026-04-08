# Cheersly
Cheersly is an application that lets people give compliments and recognition to their coworkers. It's meant to be a fun way to give out recognition. 

## General Flow
Each employee gets 50 points a month to spend on their coworkers. At the end of the month, reset the points to give away to 50.

Cheers include:
* Targets (reference to user ids): One or more coworkers to shout out
* Points (integer): A number of points to spend per coworker. This cannot exceed the user's current point count.
* Message (text): Can include text, hashtags, and images.

Points gifted are added to the receivers balance of points. These points are different than the ones allocated to give away and can accumulate month to month.

## User Types
Admin Users - can see admin pages
Normal Users - Can only see the pages

User Data includes: 
UserName (email address)
Name (first, last)
Points To Give
Points Received
User Role (Normal, Admin)

## Pages

### Main Feed
The main feed page is the default page in the Cheersly app. It's a public view of all of the shout outs, ordered by recent shout outs. 

### Profile
A page listing the shout-outs you gave or have received.

It also shows you how many points you have accumulated.

### New Cheers
This page allows you to enter a shout out. This 
page includes a rich text input that accepts a markdown message, has a selector to pick coworkers to give points to, and a numeric text input for the number of points.

### Store
This page allows you to spend your points on various items. 

## Admin Pages
Admin pages can only be seen users with the admin role.

