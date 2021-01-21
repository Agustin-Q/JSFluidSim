# JSFluidSim
 JS RealTime Fluid Simulation using GPGPU compute using WebGL.

 Link to view https://agustin-q.github.io/JSFluidSim/

 This is my experimentation to parallelize a fluid simulation based on daniel Shiffman's coding challenge https://thecodingtrain.com/CodingChallenges/132-fluid-simulation.html

 Credits:
 Mike Ash, Fluid Simulation for Dummies: https://mikeash.com/pyblog/fluid-simulation-for-dummies.html
 Jos Stam, Real-Time Fluid Dynamics for Games: https://www.dgp.toronto.edu/public_user/stam/reality/Research/pdf/GDC03.pdf
 http://www.vizitsolutions.com/portfolio/webgl/gpgpu/


 This problem is ideal to parallelize using GPGPU compute as the grid like nature of the simulation matches perfectly with the task a GPU is built to do, calculate a gird of pixel values.
 My original intention was to increase the performance over a single thread simulation (Spoiler alert: it runs slower...).

## Conclusion:

In the single threaded version with a gird of 64 x 64 cells (as is set now, TODO: grid size to be selectable in the browser instead of hardcoded) the simulation maxes out at 60fps and using WebGL the average framerate is 40fps. This is entirely because of my poor implementation, currently only the solver step that solves the linear system of equations is implemented using WebGl. This solver is called numerous times for each simulation step. Each time the solver is called, the WebGL state is set, the simulation state data is copied form main memory to video memory, textures are generated, then shaders programs are run (this is the only part where calculations are done), and finally output textures are read and copied back to main memory. This is a lot of overhead that makes the simulation run slower.

The correct implementation is to always have the simulation data in the video memory and also render using the same output texture (maybe with a shader to scale the output). This will eliminate the read and write of texture data to and from de video memory and also the generation of new textures, as the output texture can be used as the input for the next step. 

## Example:

![Screen Recording](imgs/JSFluidSimExample.gif "Screen Recoding")


