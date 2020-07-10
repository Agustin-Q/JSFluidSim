class FluidCube {
	constructor (size, diffusion, viscosity, dt, iter){
    this.size = size;
    this.dt = dt;
    this.diff = diffusion;
    this.visc = viscosity;
		this.iter = iter;

    this.s = new Float32Array(size*size);
    this.density = new Float32Array(size*size);
    this.Vx = new Float32Array(size*size);
    this.Vy = new Float32Array(size*size);
    //this.Vz = new Float32Array();

    this.Vx0 = new Float32Array(size*size);
    this.Vy0 = new Float32Array(size*size);
    //this.Vz0 = new Float32Array();
	}

	IX(x, y){
		//return ((x) + (y) * this.size + (z) * this.size * this.size);
		return (x + y * this.size);
	}


	AddDensity(x, y, amount)	{
	    this.density[this.IX(x, y)] += amount;
	}

	AddVelocity( x,y, amountX, amountY){

    var index = this.IX(x, y);

    this.Vx[index] += amountX;
    this.Vy[index] += amountY;
	}

	diffuse (b, x, x0, diff){
    var a = this.dt * diff * (this.size - 2) * (this.size - 2);
    this.lin_solve(b, x, x0, a, 1 + 6 * a);
	}

	project(velocX, velocY, p, div){
		var iter = this.iter;
		var N = this.size;
	        for (var j = 1; j < N - 1; j++) {
	            for (var i = 1; i < N - 1; i++) {
	                div[this.IX(i, j)] = -0.5*(
	                         velocX[this.IX(i+1, j )]
	                        -velocX[this.IX(i-1, j)]
	                        +velocY[this.IX(i  , j+1 )]
	                        -velocY[this.IX(i  , j-1 )])/N;
	                p[this.IX(i, j)] = 0;
	            }
	        }

	    this.set_bnd(0, div);
	    this.set_bnd(0, p);
	    this.lin_solve(0, p, div, 1, 6);


	        for (var j = 1; j < N - 1; j++) {
	            for (var i = 1; i < N - 1; i++) {
	                velocX[this.IX(i, j)] -= 0.5 * (  p[this.IX(i+1, j)]
	                                                    -p[this.IX(i-1, j)]) * N;
	                velocY[this.IX(i, j)] -= 0.5 * (  p[this.IX(i, j+1)]
	                                                    -p[this.IX(i, j-1)]) * N;

	            }
	        }

	    this.set_bnd(1, velocX);
	    this.set_bnd(2, velocY);
	}

	advect(b, d, d0,  velocX, velocY)
{
		var dt = this.dt;
		var N = this.size;
    var i0, i1, j0, j1;

    var dtx = dt * (N - 2);
    var dty = dt * (N - 2);

    var s0, s1, t0, t1;
    var tmp1, tmp2, x, y;

    var Nfloat = N;
    var ifloat, jfloat;
    var i, j;


        for(j = 1, jfloat = 1; j < N - 1; j++, jfloat++) {
            for(i = 1, ifloat = 1; i < N - 1; i++, ifloat++) {
                tmp1 = dtx * velocX[this.IX(i, j)];
                tmp2 = dty * velocY[this.IX(i, j)];
                x    = ifloat - tmp1;
                y    = jfloat - tmp2;

                if(x < 0.5) x = 0.5;
                if(x > Nfloat + 0.5) x = Nfloat + 0.5;
                i0 = Math.floor(x);
                i1 = i0 + 1.0;
                if(y < 0.5) y = 0.5;
                if(y > Nfloat + 0.5) y = Nfloat + 0.5;
                j0 = Math.floor(y);
                j1 = j0 + 1.0;


                s1 = x - i0;
                s0 = 1.0 - s1;
                t1 = y - j0;
                t0 = 1.0 - t1;

                var i0i = parseInt(i0);
                var i1i = parseInt(i1);
                var j0i = parseInt(j0);
                var j1i = parseInt(j1);


								d[this.IX(i, j)] =
	        s0 * (t0 * d0[this.IX(i0i, j0i)] + t1 * d0[this.IX(i0i, j1i)]) +
	        s1 * (t0 * d0[this.IX(i1i, j0i)] + t1 * d0[this.IX(i1i, j1i)]);
            }
        }

    this.set_bnd(b, d);
}

lin_solve(b, x, x0, a, c)	{
	//this.Gauss_Seidel_lin_solve(b, x, x0, a, c);
	this.Jacobi_lin_solve(b, x, x0, a, c);
}
	Gauss_Seidel_lin_solve(b, x, x0, a, c)	{  ///this.diffuse(0, s, density, diff);
		var iter = this.iter;
		var N = this.size;
    var cRecip = 1.0 / c;
    for (var k = 0; k < iter; k++) {
            for (var j = 1; j < N - 1; j++) {
                for (var i = 1; i < N - 1; i++) {
                    x[this.IX(i, j)] =
                                   (x0[this.IX(i, j)]
                                + a*(x[this.IX(i+1, j)]
                                    +x[this.IX(i-1, j)]
                                    +x[this.IX(i  , j+1)]
                                    +x[this.IX(i  , j-1)]
                           )) * cRecip;
                }
            }
        this.set_bnd(b, x);
    }
	}

	Jacobi_lin_solve(b, x, x0, a, c)	{
		var iter = this.iter;
		var N = this.size;
		var cRecip = 1.0 / c;
		var temResult = new Float32Array(this.size*this.size); //copia el array no se si es necesario o deberia arrancar en 0, me parece que es lo mismo.
		for (var k = 0; k < iter; k++) {
						for (var j = 1; j < N - 1; j++) {
								for (var i = 1; i < N - 1; i++) {
										temResult[this.IX(i, j)] =
																	 (x0[this.IX(i, j)]
																+ a*(x[this.IX(i+1, j)]
																		+x[this.IX(i-1, j)]
																		+x[this.IX(i  , j+1)]
																		+x[this.IX(i  , j-1)]
													 )) * cRecip;
								}
						}

				this.set_bnd(b, temResult);
				copyArray(x,temResult,this.size*this.size);
				//console.log(temResult);
		}
	}

	set_bnd(b, x){
				var N = this.size;
        for(var i = 1; i < N - 1; i++) {
            x[this.IX(i, 0  )] = b == 2 ? -x[this.IX(i, 1  )] : x[this.IX(i, 1 )];
            x[this.IX(i, N-1)] = b == 2 ? -x[this.IX(i, N-2)] : x[this.IX(i, N-2)];
        }


        for(var j = 1; j < N - 1; j++) {
            x[this.IX(0  , j)] = b == 1 ? -x[this.IX(1  , j)] : x[this.IX(1  , j)];
            x[this.IX(N-1, j)] = b == 1 ? -x[this.IX(N-2, j)] : x[this.IX(N-2, j)];
        }


    x[this.IX(0, 0)]       = 0.5 * (x[this.IX(1, 0)]      + x[this.IX(0, 1)]);
    x[this.IX(0, N-1)]     = 0.5 * (x[this.IX(1, N-1)]    + x[this.IX(0, N-2)]);
    x[this.IX(N-1, 0)]     = 0.5 * (x[this.IX(N-2, 0)]    + x[this.IX(N-1, 1)]);
    x[this.IX(N-1, N-1)]   = 0.5 * (x[this.IX(N-2, N-1)]  + x[this.IX(N-1, N-2)]);

		}

		 Step()
		{
		    var N          = this.size;
		    var visc     = this.visc;
		    var diff     = this.diff;
		    var dt       = this.dt;
		    var Vx      = this.Vx;
		    var Vy      = this.Vy;
		    var Vx0     = this.Vx0;
		    var Vy0     = this.Vy0;
		    var s       = this.s;
		    var density = this.density;
				var iter = 4;
		    this.diffuse(1, Vx0, Vx, visc);
		    this.diffuse(2, Vy0, Vy, visc);

		    this.project(Vx0, Vy0, Vx, Vy);

		    this.advect(1, Vx, Vx0, Vx0, Vy0);
		    this.advect(2, Vy, Vy0, Vx0, Vy0);

		    this.project(Vx, Vy, Vx0, Vy0);

		    this.diffuse(0, s, density, diff);
		    this.advect(0, density, s, Vx, Vy);
		}
}

function IsDiagonallyDominant(matrix, n){
	result = true;
	for (var j=0; j< n; j++){
		var sum =0;
		for (var i=0; i< n; i++){
			if(i!=j) sum += matrix[i+j*n];
		}
		if(matrix[j+j*n] < sum) result = false;
	}
	return result;
}

function copyArray(a,b,len){
	for (var i = 0; i<len;i++){
		a[i] = b[i];
	}
}
