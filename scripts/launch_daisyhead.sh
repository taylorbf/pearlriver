#!/bin/bash

# score_dir is on client machines
export score_dir='~/Desktop/lol-fall2013/daisyhead/'

/usr/bin/osascript << EOT

	set compyName to computer name of (system info)
	
	if compyName = "one"
   		tell app "Terminal"
        activate
	    	do script "cd $score_dir; node daisyserver.js"
    	end tell
	end if
	
	if compyName = "video"
		
	else
		tell app "Terminal"
			activate
				do script "cd $score_dir; open -a 'Google Chrome' daisyhead.html"
	    end tell
	end if
EOT
