function [matrix_graph] = genGraph(nodes, conn)
rng('shuffle');
if nargin > 2
  density = conn/nodes;
else
  density = nodes/nodes; % a rough estimate of the amount of edges  
end
value_max = 50;  
A = sprand( nodes, nodes, density ); % generate adjacency matrix at random
% normalize weights to sum to num of edges
A = tril( A, -1 );    
%A = spfun( @(x) x./nnz(A), A );    
% make it symmetric (for undirected graph)
A = A + A.';
A(1, nodes) = 0;
A(nodes, 1) = 0;
A = A.* value_max;
A = fix(A);
matrix_graph = full(A);
G = graph(A);

%% Call the MATLAB shortestpath function 
shortestpath(G,1,nodes,'Method','positive')
end

