

#include <iostream>
#include <sstream>
#include <vector>
#include <algorithm>

using std::vector;
using std::stringstream;

using Val = float;

char buf[1 << 20];

struct Mat {
    vector<Val> data;
    size_t rows, cols;

    Mat(size_t m, size_t n) : rows(m), cols(n) {
        data = vector<Val>(m * n);
    }

    Mat(size_t n) : rows(n), cols(n) {
        data = vector<Val>(n * n);
    }
    
    Val& operator()(size_t i, size_t j) {
        return data[i * cols + j];
    }
    Val operator()(size_t i, size_t j) const {
        return data[i * cols + j];
    }

    // Val& operator[](size_t i) {
    //     return data[i];
    // }
    
    Mat mul(const Mat& other) const {
        const size_t m = rows;
        const size_t n = cols;
        const size_t p = other.cols;
        Mat result(m, p);
        for (size_t i = 0; i < m; ++i) {
            for (size_t k = 0; k < n; ++k) {
                for (size_t j = 0; j < p; ++j) {
                    result(i, j) += (*this)(i, k) * other(k, j);
                }
            }
        }
        return result;
    }
    Mat diagAdd(const Val x) const {
        Mat result = *this;
        for (size_t i = 0; i < cols; ++i)
            result(i, i) += x;
        return result;
    }
    Val trace() const {
        Val result = 0;
        for (size_t i = 0; i < cols; ++i) {
            result += (*this)(i, i);
        }
        return result;
    }
};

extern "C" const char* characteristic(const char* graph) {

    stringstream stream(graph);
    size_t n;
    stream >> n;
    Mat A(n);
    for (Val& v : A.data) {
        stream >> v;
    }
    vector<Val> coff(n + 1);
    coff[n] = 1;
    Mat C = A;
    
    for (size_t k = 1; k <= n; ++k) {
        if (k > 1) {
            C = A.mul(C.diagAdd(coff[n - k + 1]));
        }
        coff[n - k] = -C.trace() / k;
    }

    memset(buf, 0, sizeof(buf));
    stringstream outstream;
    outstream << "[";
    for (size_t i = 0; i <= n; ++i) {
        outstream << coff[i];
        if (i < n) outstream << ',';
    }
    outstream << "]";
    strcpy(buf, outstream.str().c_str());
    return buf;
}


extern "C" const char* checkIsomorphism(const char* graph_data) {
    std::stringstream stream(graph_data);
    size_t n;
    stream >> n;
    vector<size_t> graph1(n * n), graph2(n * n);
    for (size_t i = 0; i < n * n; ++i) {
        stream >> graph1[i];
    }
    for (size_t i = 0; i < n * n; ++i) {
        stream >> graph2[i];
    }

    vector<size_t> map(n);
    std::generate(map.begin(), map.end(), [x = 0]() mutable { return x++; });

    bool have = false;

    do {
        bool ok = true;
        for (size_t i = 0; i < n && ok; ++i) {
            for (size_t j = 0; j < n; ++j) {
                if (graph1[i * n + j] != graph2[map[i] * n + map[j]]) {
                    ok = false;
                    break;
                }
            }
        }
        if (ok) {
            have = true;
            break;
        }
    } while (std::next_permutation(map.begin(), map.end()));
    
    memset(buf, 0, sizeof(buf));
    if (have) {
        stringstream outstream;
        outstream << "[";
        for (size_t i = 0; i < n; ++i) {
            outstream << map[i];
            if (i < n - 1) outstream << ',';
        }
        outstream << "]";
        strcpy(buf, outstream.str().c_str());
    }
    return buf;
}