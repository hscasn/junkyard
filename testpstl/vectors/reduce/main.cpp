#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/numeric"

#define ARRSZ 200000000

typedef float mytype;

void pvec(std::vector<mytype>& a)
{
	Timer t;

	t.start();
	size_t sum = std::reduce(
		std::execution::par_unseq,
		a.begin(),
		a.end()
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;
	std::cout << "Time for vector vectorized parallel reduce: " << t << std::endl << std::endl;
}

void vec(std::vector<mytype>& a)
{
	Timer t;

	t.start();
	size_t sum = std::reduce(
		std::execution::unseq,
		a.begin(),
		a.end()
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;
	std::cout << "Time for vector vectorized reduce: " << t << std::endl << std::endl;
}

void par(std::vector<mytype>& a)
{
	Timer t;

	t.start();
	size_t sum = std::reduce(
		std::execution::par,
		a.begin(),
		a.end()
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;
	std::cout << "Time for vector parallel reduce: " << t << std::endl << std::endl;
}

void serial(std::vector<mytype>& a)
{
	Timer t;

	t.start();
	size_t sum = std::reduce(
		std::execution::seq,
		a.begin(),
		a.end()
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;
	std::cout << "Time for vector serial reduce: " << t << std::endl << std::endl;
}


int main()
{
	srand(1);

	std::vector<mytype> a;
	size_t sum;

	for (size_t i = 0; i < ARRSZ; i++)
		a.push_back(rand());

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		serial(a);
		par(a);
		vec(a);
		pvec(a);
	}

	getchar();
	return 0;
}

