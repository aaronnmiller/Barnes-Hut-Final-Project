# Barnes-Hut Gravity Simulator

The purpose of this project is to calculate and display planetary motion using a Barnes-Hut tree to store the objects. The main reason for using a Barnes-Hut tree is its ability to easily store many objects and also generalize the position of multiple objects so finding forces takes fewer calculations.

## Using the program

The only file that needs to be manually run is 'index.html' in a browser. A blank canvas will appear:

![blank_canvas](/sample_images/blank_canvas.png)

## Adding Objects
There are three ways to add objects to the canvas.
1) Clicking on the canvas

Click on the canvas, and an object will be placed:
![click](/sample_images/click_on_canvas.png)

This object has the mass of the average of the min and max mass allowed, with no velocity.

While clicking on the canvas, you can drag to give the object velocity in the direction of the drag:

![green_arrow](/sample_images/green_arrow.png)

2) Adding an object manually

If there are specific values for an object that you would like to input, the "Add Specific Object" section in the settings menu allows for this.

Input numeric values for each parameter (X position, Y position, X velocity, Y velocity, Object Mass), and click "Add Object":

![specific_object](/sample_images/specific_object.png)

Note: the mass is multiplied by 10^9kg for realistic physics values. This is for ease of user input. Reasonable ranges for user inputted values range from 0 to 100.

3) Add random objects

If you simply want to add random objects to the simulation, input a number of random objects and click the "Add Objects" button. This will place objects with a random mass, x position, and y position throughout the canvas:

![random_objects](/sample_images/random_objects.png)

## Other features
### Trail Opacity
Moving the trail opacity higher than 0 allows you to see the path that objects take (and it also can make pretty cool patterns). Any values below 100 ends up graying out eventually:

![gray_trails](/sample_images/gray_trails.png)

If you set the opacity to 100, the trails will be the solid color of the objects:

![color_trails](/sample_images/color_trails.png)

### Speed Factor

This controls the speed at which the simulation runs. The values on the slider are exponential, meaning slight changes can still have a big effect. Values at either end of the range are extreme, but can still be useful.

### Allow Collisions

This feature allows two objects to combine if they get within a certain distance of each other (the default distance is 5 pixels). When this happens, the masses and velocities of the two objects are combined. 

### Object color

This setting changes the color of the objects in the canvas (and also the color of the trails if the setting is turned on). This option is purely for aesthetic purposes. 

### Show additional data

This setting shows some stats about the tree being used at any given moment:

![additional_data](/sample_images/additional_data.png)

This data is not necessary to using the application, but is a simple representation of the state of the Barnes-Hut tree.

### Realistic Physics Constraints

Switching this on makes the physics in the simulation less visually appealing but realistic. If checked, the constants are:\
G = 6.67e-11\
exponent for multiplying radius between two objects = 2

If unchecked, the constants are:\
G = 1e-5\
exponent = 1.3

In addition, if the box is checked, the speed of the simulation will be an unadjustable value.

This produces accurate planetary motion, but the motion appears to be slow and the effect of forces appears to be less drastic. 
