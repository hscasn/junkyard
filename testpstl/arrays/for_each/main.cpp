#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 250000000

typedef uint32_t mytype;

template<class T>
void pvec(mytype* a, T& action)
{
	Timer t;
	t.start();
	std::for_each(
		std::execution::par_unseq,
		a,
		a + ARRSZ,
		action
	);
	t.stop();

	std::cout << "Time for array parallel vectorized for_each: " << t << std::endl << std::endl;
}

template<class T>
void vec(mytype* a, T& action)
{
	Timer t;
	t.start();
	std::for_each(
		std::execution::unseq,
		a,
		a + ARRSZ,
		action
	);
	t.stop();

	std::cout << "Time for array vectorized for_each: " << t << std::endl << std::endl;
}

template<class T>
void par(mytype* a, T& action)
{
	Timer t;
	t.start();
	std::for_each(
		std::execution::par,
		a,
		a + ARRSZ,
		action
	);
	t.stop();

	std::cout << "Time for array parallel for_each: " << t << std::endl << std::endl;
}

template<class T>
void serial(mytype* a, T& action)
{
	Timer t;
	t.start();
	std::for_each(
		std::execution::seq,
		a,
		a + ARRSZ,
		action
	);
	t.stop();

	std::cout << "Time for array serial for_each: " << t << std::endl << std::endl;
}


int main()
{
	srand(1);

	__declspec(align(64)) mytype* a = new mytype[ARRSZ];

	for (size_t i = 0; i < ARRSZ; i++) 
		a[i] = rand();

	size_t sum;
	auto action = [&](mytype& i) { return sum += i; };

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		sum = 0;
		serial<decltype(action)>(a, action);
		//par<decltype(action)>(a, action);
		//vec<decltype(action)>(a, action);
		//pvec<decltype(action)>(a, action);
		std::cout << "Sum: " << sum << std::endl;
	}

	delete[] a;

	getchar();
	return 0;
}

