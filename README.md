# googleMapsDirectionsKMLandKMZ
Google Maps app with directions that loads KML and KMZ in through URL (var: ?url=[url of KML/KMZ] )

I built this application because Google decided to drop support for displaying KML/KMZ in Google Maps.

This application uses jQuery, jQuery UI, Google Driving Directions, and a Context menu that I found at: 
http://googleapitips.blogspot.com/p/google-maps-api-v3-context-menu-example.html

Great article that shows how to build context menus.

I also used jquery.dialogextend.js located at: https://github.com/ROMB/jquery-dialogextend

It extends the jQuery UI Dialog box.

To use the app, run it in Visual Studio or run the index and attach kml after the index.html?url=

For example:

index.html?url=http://kml-samples.googlecode.com/svn/trunk/kml/Region/polygon-simple.kml

http://kml-samples.googlecode.com/svn/trunk/kml/kmz/balloon/balloon-image-rel.kml
http://kml-samples.googlecode.com/svn/trunk/kml/Region/GroundOverlay/usa-ca-sf.kml
http://kml-samples.googlecode.com/svn/trunk/kml/Region/ScreenOverlay/continents.kml
http://kml-samples.googlecode.com/svn/trunk/kml/Model/ResourceMap/macky-alt.kml

You can find more samples at http://www.seanjosephokefe.com
Follow me at Twitter @seanjokeefe
Tumblr at: http://seanjosephokeefe.tumblr.com/