var card_pictures = [
    "money-1.png",
    "money-10.png",
    "money-2.png",
    "money-3.png",
    "money-4.png",
    "money-5.png",
    "prop-brown-1.png",
    "prop-brown-2.png",
    "prop-dblue-1.png",
    "prop-dblue-2.png",
    "prop-green-1.png",
    "prop-green-2.png",
    "prop-green-3.png",
    "prop-lblue-1.png",
    "prop-lblue-2.png",
    "prop-lblue-3.png",
    "prop-orange-1.png",
    "prop-orange-2.png",
    "prop-orange-3.png",
    "prop-purple-1.png",
    "prop-purple-2.png",
    "prop-purple-3.png",
    "prop-rail-1.png",
    "prop-rail-2.png",
    "prop-rail-3.png",
    "prop-rail-4.png",
    "prop-red-1.png",
    "prop-red-2.png",
    "prop-red-3.png",
    "prop-utility-1.png",
    "prop-utility-2.png",
    "prop-wildcard-any.png",
    "prop-wildcard-brown-lblue.png",
    "prop-wildcard-green-dblue.png",
    "prop-wildcard-green-rail.png",
    "prop-wildcard-lblue-rail.png",
    "prop-wildcard-orange-purple.png",
    "prop-wildcard-red-yellow.png",
    "prop-wildcard-utility-rail.png",
    "prop-yellow-1.png",
    "prop-yellow-2.png",
    "prop-yellow-3.png",
    "rent-any.png",
    "rent-brown-lblue.png",
    "rent-green-dblue.png",
    "rent-purple-orange.png",
    "rent-rail-utility.png",
    "rent-red-yellow.png",
]

for (let i = 0; i < card_pictures.length; index++) {
    const card_picture = card_pictures[i];
    

    var sheet = (function() {
        // Create the <style> tag
        var style = document.createElement("style");
    
        // Add a media (and/or media query) here if you'd like!
        // style.setAttribute("media", "screen")
        // style.setAttribute("media", "only screen and (max-width : 1024px)")
    
        // WebKit hack :(
        style.appendChild(document.createTextNode(""));
    
        // Add the <style> element to the page
        document.head.appendChild(style);
    
        return style.sheet;
    })();
    
}