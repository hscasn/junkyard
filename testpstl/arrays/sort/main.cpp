#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 200000000

typedef uint16_t mytype;

template<class T>
void pvec(mytype* a, T& sorter)
{
	Timer t;
	t.start();
	std::sort(
		std::execution::par_unseq,
		a,
		a + ARRSZ,
		sorter
	);
	t.stop();

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for array parallel vectorized sort: " << t << std::endl << std::endl;
}

template<class T>
void vec(mytype* a, T& sorter)
{
	Timer t;
	t.start();
	std::sort(
		std::execution::unseq,
		a,
		a + ARRSZ,
		sorter
	);
	t.stop();

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for array vectorized sort: " << t << std::endl << std::endl;
}

template<class T>
void par(mytype* a, T& sorter)
{
	Timer t;
	t.start();
	std::sort(
		std::execution::par,
		a,
		a + ARRSZ,
		sorter
	);
	t.stop();

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for array parallel sort: " << t << std::endl << std::endl;
}

template<class T>
void serial(mytype* a, T& sorter)
{
	Timer t;

	t.start();
	std::sort(
		std::execution::seq,
		a,
		a + ARRSZ,
		sorter
	);
	t.stop();

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for array serial sort: " << t << std::endl << std::endl;
}

void refill(mytype* a) {
	srand(1);
	for (size_t i = 0; i < ARRSZ; i++)
		a[i] = rand();
}


int main()
{
	mytype* a = new mytype[ARRSZ];

	auto sorter = [](mytype a, mytype b) { return a < b; };

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		refill(a);
		serial<decltype(sorter)>(a, sorter);
		refill(a);
		par<decltype(sorter)>(a, sorter);
		refill(a);
		vec<decltype(sorter)>(a, sorter);
		refill(a);
		pvec<decltype(sorter)>(a, sorter);
	}

	getchar();
	return 0;
}

