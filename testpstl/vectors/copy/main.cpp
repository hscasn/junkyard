#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 100000000

typedef float mytype;

void pvec(std::vector<mytype>& a, std::vector<mytype>& b)
{
	Timer t;
	size_t sum;

	for (size_t i = 0; i < ARRSZ; i++) b[i] = 0;
	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	t.start();
	std::copy(
		std::execution::par_unseq,
		a.begin(),
		a.end(),
		b.begin()
	);
	t.stop();

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	std::cout << "Time for vector parallel vectorized copy: " << t << std::endl << std::endl;
}

void vec(std::vector<mytype>& a, std::vector<mytype>& b)
{
	Timer t;
	size_t sum;

	for (size_t i = 0; i < ARRSZ; i++) b[i] = 0;
	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	t.start();
	std::copy(
		std::execution::unseq,
		a.begin(),
		a.end(),
		b.begin()
	);
	t.stop();

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	std::cout << "Time for vector vectorized copy: " << t << std::endl << std::endl;
}

void par(std::vector<mytype>& a, std::vector<mytype>& b)
{
	Timer t;
	size_t sum;

	for (size_t i = 0; i < ARRSZ; i++) b[i] = 0;
	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	t.start();
	std::copy(
		std::execution::par,
		a.begin(),
		a.end(),
		b.begin()
	);
	t.stop();

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	std::cout << "Time for vector parallel copy: " << t << std::endl << std::endl;
}

void serial(std::vector<mytype>& a, std::vector<mytype>& b)
{
	Timer t;
	size_t sum;

	for (size_t i = 0; i < ARRSZ; i++) b[i] = 0;
	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	t.start();
	std::copy(
		std::execution::seq,
		a.begin(),
		a.end(),
		b.begin()
	);
	t.stop();

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	std::cout << "Time for vector serial copy: " << t << std::endl << std::endl;
}


int main()
{
	srand(1);

	std::vector<mytype> a;
	std::vector<mytype> b;
	size_t sum;

	for (size_t i = 0; i < ARRSZ; i++) {
		a.push_back(rand());
		b.push_back(0);
	}


	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Correct sum: " << sum << std::endl;

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += b[i];
	std::cout << "Sum at B: " << sum << std::endl;

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		serial(a, b);
		par(a, b);
		vec(a, b);
		pvec(a, b);
	}

	getchar();
	return 0;
}

