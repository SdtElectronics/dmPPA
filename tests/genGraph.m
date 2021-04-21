function [matrix_graph] = genGraph(nodes, edge_max)
if nargin > 2
  value_max = edge_max;
else
  value_max = 50;
end
matrix_graph_tmp=fix(rand(nodes).*value_max)+1;%create a random matrix
matrix_graph_tmp(nodes,1)=0;  % cancel the edge connecting the starting node and the ending node directly
matrix_graph_tmp(1,nodes)=0;  % cancel the edge connecting the starting node and the ending node directly
% If we do not cancel this edge, this edge is highly likely to be the --
% shortest path, which makes the testing less significant.
matrix_graph_tmp2=tril(matrix_graph_tmp)+(tril(matrix_graph_tmp))';%Create a symmetric matrix with diagonal elements all 0
matrix_graph=matrix_graph_tmp2-2.*diag(diag(matrix_graph_tmp));%Create a symmetric matrix with diagonal elements all 0
% so the "matrix_graph" is the adjacent matrix of the test graph 
text_graph=graph(matrix_graph); % MATLAB graph for the MATLAB shortestpath function 

%% Call the MATLAB shortestpath function 
shortestpath(text_graph,1,nodes,'Method','positive')
end

