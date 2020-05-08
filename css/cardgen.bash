#!/usr/bin/bash

card_pictures=( money-1.png       prop-green-1.png   prop-purple-2.png   prop-utility-2.png               prop-yellow-2.png
money-10.png      prop-green-2.png   prop-purple-3.png   prop-wildcard-any.png            prop-yellow-3.png
money-2.png       prop-green-3.png   prop-rail-1.png     prop-wildcard-brown-lblue.png    rent-any.png
money-3.png       prop-lblue-1.png   prop-rail-2.png     prop-wildcard-green-dblue.png    rent-brown-lblue.png
money-4.png       prop-lblue-2.png   prop-rail-3.png     prop-wildcard-green-rail.png     rent-green-dblue.png
money-5.png       prop-lblue-3.png   prop-rail-4.png     prop-wildcard-lblue-rail.png     rent-purple-orange.png
prop-brown-1.png  prop-orange-1.png  prop-red-1.png      prop-wildcard-orange-purple.png  rent-rail-utility.png
prop-brown-2.png  prop-orange-2.png  prop-red-2.png      prop-wildcard-red-yellow.png     rent-red-yellow.png
prop-dblue-1.png  prop-orange-3.png  prop-red-3.png      prop-wildcard-utility-rail.png
prop-dblue-2.png  prop-purple-1.png  prop-utility-1.png  prop-yellow-1.png
)

for t in ${card_pictures[@]}; do
    echo ".${t%%.*} {
            background-image: url(../cards/$t)
        }
        " >> cards.css  
done