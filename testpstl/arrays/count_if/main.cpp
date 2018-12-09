#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 500000000

typedef uint16_t mytype;

template<class T>
void pvec(mytype* a, T& condition)
{
	Timer t;
	t.start();
	size_t sum = std::count_if(
		std::execution::par_unseq,
		a,
		a + ARRSZ,
		condition
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for array parallel vectorized count_if: " << t << std::endl << std::endl;
}

template<class T>
void vec(mytype* a, T& condition)
{
	Timer t;
	t.start();
	size_t sum = std::count_if(
		std::execution::unseq,
		a,
		a + ARRSZ,
		condition
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for array vectorized count_if: " << t << std::endl << std::endl;
}

template<class T>
void par(mytype* a, T& condition)
{
	Timer t;
	t.start();
	size_t sum = std::count_if(
		std::execution::par,
		a,
		a + ARRSZ,
		condition
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for array parallel count_if: " << t << std::endl << std::endl;
}

template<class T>
void serial(mytype* a, T& condition)
{
	Timer t;
	t.start();
	size_t sum = std::count_if(
		std::execution::seq,
		a,
		a + ARRSZ,
		condition
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for array serial count_if: " << t << std::endl << std::endl;
}


int main()
{
	srand(1);

	__declspec(align(64)) mytype* a = new mytype[ARRSZ];

	for (size_t i = 0; i < ARRSZ; i++) 
		a[i] = rand();

	auto condition = [](mytype& i) { return i % 3 == 0; };

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		serial<decltype(condition)>(a, condition);
		par<decltype(condition)>(a, condition);
		vec<decltype(condition)>(a, condition);
		pvec<decltype(condition)>(a, condition);
	}

	delete[] a;

	getchar();
	return 0;
}

